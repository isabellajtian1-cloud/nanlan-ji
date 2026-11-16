import hashlib
import html
import json
import os
import re
import shutil
import subprocess
import tempfile
import time
import urllib.request
import zipfile
from pathlib import Path

from playwright.sync_api import Error as BrowserError, sync_playwright


def git(*args):
    return subprocess.check_output(["git", *args])


def wait_for_publication(page, base_url, branch, report):
    deadline = time.monotonic() + 9 * 60
    while time.monotonic() < deadline:
        git("fetch", "--quiet", "--no-tags", "--depth=1", "origin", f"refs/heads/{branch}")
        revision = git("rev-parse", "FETCH_HEAD").decode().strip()
        index = git("show", f"{revision}:index.html")
        title = re.search(r"<title\b[^>]*>(.*?)</title>", index.decode(), re.I | re.S)
        if not title:
            raise ValueError(f"Missing game title in {revision}:index.html")
        expected = html.unescape(title[1]).strip()
        url = f"{base_url}?build={revision[:12]}&check={time.time_ns()}"
        report.update(sha=revision, expected_title=expected, url=url)
        try:
            response = page.goto(url, wait_until="domcontentloaded", timeout=30000)
            observed = page.title()
            report.update(observed_title=observed, http_status=response.status if response else None)
            if response and response.ok and observed == expected:
                # Static Pages may normalize line endings during publication.
                if response.body().replace(b"\r\n", b"\n") == index.replace(b"\r\n", b"\n"):
                    return revision
            print(f"Waiting for {revision[:12]} ({expected}), got {report['http_status']} {observed}", flush=True)
        except BrowserError as error:
            print(f"Waiting for Pages: {error}", flush=True)
        time.sleep(12)
    raise TimeoutError(f"Pages did not serve {report['sha']}:index.html before the publication deadline")


def verify_archive(repository, revision, report):
    url = f"https://github.com/{repository}/archive/{revision}.zip"
    report["archive"] = url
    expected = {}
    for entry in git("ls-tree", "-rz", revision).split(b"\0"):
        if entry:
            metadata, path = entry.split(b"\t", 1)
            expected[path.decode()] = metadata.split()[2].decode()

    prefix = f"{repository.split('/')[-1]}-{revision}/"
    with tempfile.TemporaryFile() as download:
        with urllib.request.urlopen(url, timeout=90) as response:
            shutil.copyfileobj(response, download)
        with zipfile.ZipFile(download) as archive:
            files = [entry.filename for entry in archive.infolist() if not entry.is_dir()]
            if sorted(files) != sorted(prefix + path for path in expected):
                raise ValueError("The archive file list differs from the published commit")
            for path, expected_hash in expected.items():
                data = archive.read(prefix + path)
                digest = hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()
                if digest != expected_hash:
                    raise ValueError(f"Archive contents differ for {path}")
    report.update(files=len(expected), zip_verified=True)


def verify_game(page, report):
    page.wait_for_function("typeof engine !== 'undefined' && !!window.NanlanDepth?.raster && document.getElementById('bootStatus').hidden")
    page.evaluate("""() => {
        engine.reset('female');
        const result = engine.save();
        if (!result.ok) throw Error(result.message);
    }""")
    page.reload(wait_until="domcontentloaded")
    if page.title() != report["expected_title"]:
        raise ValueError(f"Game version changed while restoring the save: {page.title()}")
    page.locator("#continueGame").click()
    page.wait_for_function("started && active && !transitioning && images.gaitFemale?.naturalWidth")
    scene, width, height = page.evaluate("() => [state().scene, images.gaitFemale.naturalWidth, images.gaitFemale.naturalHeight]")
    if (scene, width, height) != ("gate", 3120, 1620):
        raise ValueError(f"Unexpected restored scene or character artwork: {scene}, {width}x{height}")
    report.update(online=True, scene=scene, character_size=[width, height])


def main():
    repository = os.environ["GITHUB_REPOSITORY"]
    owner, name = repository.split("/")
    site = f"https://{owner}.github.io/{name}/"
    report = {}
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(channel="chrome")
            page = browser.new_page(viewport={"width": 1100, "height": 760}, locale="zh-CN")
            page.set_default_timeout(60000)
            revision = wait_for_publication(page, site, os.environ["PUBLISH_BRANCH"], report)
            verify_game(page, report)
            browser.close()
        verify_archive(repository, revision, report)
    except Exception as error:
        report["error"] = str(error)
        raise
    finally:
        result = json.dumps(report, ensure_ascii=False, indent=2)
        Path("public-verification.json").write_text(result + "\n", encoding="utf-8")
        print(result, flush=True)


if __name__ == "__main__":
    main()
