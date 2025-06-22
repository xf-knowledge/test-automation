# 基础练习题

## 练习1：页面标题验证

> **题目要求**：使用Selenium打开指定网页，验证页面标题是否正确。

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
import time

def test_page_title():
    """练习1：验证页面标题"""
    driver = webdriver.Chrome()
    
    try:
        # 打开百度首页
        driver.get("https://www.baidu.com")
        
        # 获取页面标题
        actual_title = driver.title
        expected_title = "百度一下，你就知道"
        
        # 验证标题
        assert expected_title in actual_title, f"页面标题不正确！预期包含：{expected_title}，实际：{actual_title}"
        print(f"✅ 页面标题验证成功：{actual_title}")
        
    except Exception as e:
        print(f"❌ 测试失败：{e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    test_page_title()
```

## 练习2：搜索功能测试

> **题目要求**：在百度搜索框中输入内容并执行搜索，验证搜索结果。

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_search_function():
    """练习2：搜索功能测试"""
    driver = webdriver.Chrome()
    
    try:
        # 打开百度首页
        driver.get("https://www.baidu.com")
        
        # 定位搜索框并输入内容
        search_box = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "kw"))
        )
        search_keyword = "Selenium自动化测试"
        search_box.clear()
        search_box.send_keys(search_keyword)
        search_box.send_keys(Keys.RETURN)
        
        # 等待搜索结果页面加载
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "content_left"))
        )
        
        # 验证搜索结果
        results = driver.find_elements(By.CSS_SELECTOR, ".result.c-container")
        assert len(results) > 0, "没有找到搜索结果"
        print(f"✅ 搜索功能测试成功，找到 {len(results)} 个结果")
        
        # 验证搜索关键词是否出现在页面中
        page_source = driver.page_source
        assert search_keyword in page_source, f"搜索关键词 '{search_keyword}' 未在结果页面中找到"
        print(f"✅ 搜索关键词验证成功")
        
    except Exception as e:
        print(f"❌ 搜索测试失败：{e}")
        driver.save_screenshot("search_error.png")
    finally:
        driver.quit()

if __name__ == "__main__":
    test_search_function()
```

## 练习3：表单操作综合练习

> **题目要求**：模拟用户注册表单填写，包括文本输入、下拉选择、复选框等操作。

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_form_operations():
    """练习3：表单操作综合练习"""
    driver = webdriver.Chrome()
    
    try:
        # 打开测试表单页面
        driver.get("https://www.selenium.dev/selenium/web/web-form.html")
        
        # 等待页面加载
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "my-text"))
        )
        
        # 1. 文本输入框操作
        text_input = driver.find_element(By.NAME, "my-text")
        text_input.clear()
        text_input.send_keys("测试用户")
        print("✅ 文本输入完成")
        
        # 2. 密码输入框操作
        password_input = driver.find_element(By.NAME, "my-password")
        password_input.clear()
        password_input.send_keys("test123456")
        print("✅ 密码输入完成")
        
        # 3. 文本域操作
        textarea = driver.find_element(By.NAME, "my-textarea")
        textarea.clear()
        textarea.send_keys("这是测试文本域的内容")
        print("✅ 文本域输入完成")
        
        # 4. 下拉框操作
        dropdown = Select(driver.find_element(By.NAME, "my-select"))
        dropdown.select_by_visible_text("Two")
        print("✅ 下拉框选择完成")
        
        # 5. 复选框操作
        checkboxes = driver.find_elements(By.NAME, "my-check")
        for checkbox in checkboxes[:2]:  # 选择前两个复选框
            if not checkbox.is_selected():
                checkbox.click()
        print("✅ 复选框操作完成")
        
        # 6. 单选框操作  
        radio_buttons = driver.find_elements(By.NAME, "my-radio")
        if len(radio_buttons) > 1:
            radio_buttons[1].click()  # 选择第二个单选框
            print("✅ 单选框操作完成")
        
        # 7. 提交表单
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_button.click()
        print("✅ 表单提交完成")
        
        # 验证提交结果
        WebDriverWait(driver, 10).until(
            EC.url_changes(driver.current_url)
        )
        print(f"✅ 表单操作测试完成，当前页面：{driver.current_url}")
        
    except Exception as e:
        print(f"❌ 表单操作测试失败：{e}")
        driver.save_screenshot("form_error.png")
    finally:
        driver.quit()

if __name__ == "__main__":
    test_form_operations()
```