from time import sleep
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

opts = UiAutomator2Options()
opts.set_capability("platformName", "Android")
opts.set_capability("appium:automationName", "UiAutomator2")
opts.set_capability("appium:deviceName", "Android")
opts.set_capability("appium:noReset", True)
# 설정 앱
opts.set_capability("appium:appPackage", "com.android.settings")
opts.set_capability("appium:appActivity", "com.android.settings.Settings")
# 안정화/타임아웃
opts.set_capability("appium:newCommandTimeout", 1200)
opts.set_capability("appium:adbExecTimeout", 600000)
opts.set_capability("appium:disableWindowAnimation", True)

driver = webdriver.Remote("http://127.0.0.1:4723", options=opts)

try:
    # 아무 요소나 하나 보일 때까지 대기 (설정의 검색바 등)
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((AppiumBy.CLASS_NAME, "android.widget.FrameLayout"))
    )
    # 스크롤 두 번
    driver.swipe(500, 1500, 500, 400, 400)
    sleep(1)
    driver.swipe(500, 1500, 500, 400, 400)
    sleep(1)
finally:
    driver.quit()
