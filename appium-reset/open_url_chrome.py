from time import sleep
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

URL = "https://example.com"  # 원하는 주소로 바꿔도 됨

opts = UiAutomator2Options()
opts.set_capability("platformName", "Android")
opts.set_capability("appium:automationName", "UiAutomator2")
opts.set_capability("appium:deviceName", "Android")
opts.set_capability("appium:noReset", True)
# 아무 앱으로 시작해도 되지만, 명시적으로 크롬 지정
opts.set_capability("appium:appPackage", "com.android.chrome")
opts.set_capability("appium:appActivity", "com.google.android.apps.chrome.Main")
# 안정화 옵션
opts.set_capability("appium:newCommandTimeout", 1200)
opts.set_capability("appium:adbExecTimeout", 600000)
opts.set_capability("appium:disableWindowAnimation", True)

d = webdriver.Remote("http://127.0.0.1:4723", options=opts)

try:
    # 1) 크롬 첫 실행 온보딩/약관 화면 우회(있을 때만 처리)
    def click_texts(texts):
        for t in texts:
            try:
                el = WebDriverWait(d, 2).until(
                    EC.presence_of_element_located((AppiumBy.ANDROID_UIAUTOMATOR, f'new UiSelector().textContains("{t}")'))
                )
                el.click(); sleep(0.3)
            except: pass

    click_texts(["동의", "동의하고 계속", "건너뛰기", "아니요", "확인",
                 "Accept", "I agree", "No thanks", "Skip", "Continue", "Next", "OK"])

    # 2) 인텐트로 URL 바로 열기 (주소창 타이핑 없이)
    #   adb shell am start -a VIEW -d "<URL>" -n com.android.chrome/.Main 과 동일
    d.execute_script("mobile: shell", {
        "command": "am",
        "args": ["start", "-a", "android.intent.action.VIEW", "-d", URL,
                 "-n", "com.android.chrome/com.google.android.apps.chrome.Main"],
        "timeout": 20000
    })
    sleep(3)

    # 3) (선택) 기본 브라우저 선택/1회만 열기 팝업 처리
    click_texts(["한 번만", "항상", "Just once", "Always"])

    # 4) 로딩 기다렸다가 스크린샷 저장 (검증)
    sleep(3)
    d.get_screenshot_as_file("chrome_result.png")
    print("✅ Done. Saved: chrome_result.png")

finally:
    d.quit()
