# 基础交互：元素与浏览器核心操作

> 定位到元素后，下一步就是对其进行操作或获取其状态。本节介绍Selenium WebDriver的核心操作方法。

## 元素交互操作

### 基本输入操作

#### send_keys() - 模拟键盘输入
```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

# 基本文本输入
username_field = driver.find_element(By.ID, "username")
username_field.send_keys("testuser")

# 在搜索框中输入关键词
search_box = driver.find_element(By.NAME, "q")
search_box.send_keys("selenium")
search_box.send_keys(Keys.RETURN)  # 回车键

# 组合键操作
search_box.send_keys(Keys.CONTROL, "a")  # Ctrl+A全选
search_box.send_keys(Keys.CONTROL, "c")  # Ctrl+C复制
```

#### clear() - 清空文本
```python
password_field = driver.find_element(By.ID, "password")
password_field.clear()  # 清除现有内容
password_field.send_keys("newpassword")
```

#### click() - 模拟鼠标单击
```python
# 点击按钮、链接、复选框等
login_button = driver.find_element(By.ID, "login")
login_button.click()
```

#### submit() - 提交表单
```python
# 提交表单，可以应用于表单内的任意元素
# 效果等同于点击提交按钮或在输入框中按回车
username_field = driver.find_element(By.ID, "username")
username_field.submit()
```

## 获取元素状态

### 获取元素信息

#### .text - 获取元素文本内容
```python
element = driver.find_element(By.ID, "message")
text_content = element.text
print(f"元素文本：{text_content}")
```

#### .size - 获取元素尺寸
```python
element = driver.find_element(By.ID, "button")
size_info = element.size  # 返回字典：{'height': 30, 'width': 100}
height = size_info['height']
width = size_info['width']
```

#### get_attribute() - 获取元素属性
```python
element = driver.find_element(By.ID, "submit-btn")

# 获取各种属性值
class_name = element.get_attribute("class")
href = element.get_attribute("href")
value = element.get_attribute("value")
src = element.get_attribute("src")
```

### 元素状态检查

#### is_displayed() - 判断元素是否可见
```python
element = driver.find_element(By.ID, "error-message")
if element.is_displayed():
    print("错误信息可见")
else:
    print("错误信息隐藏")
```

#### is_enabled() - 判断元素是否可用
```python
submit_button = driver.find_element(By.ID, "submit")
if submit_button.is_enabled():
    print("按钮可点击")
else:
    print("按钮被禁用")
```

#### is_selected() - 判断复选框或单选按钮是否被选中
```python
checkbox = driver.find_element(By.ID, "agree")
if checkbox.is_selected():
    print("复选框已选中")
else:
    print("复选框未选中")
```

## 浏览器控制

### 页面导航

#### get() - 打开指定网址
```python
driver.get("https://www.example.com")
```

#### refresh() - 刷新当前页面
```python
driver.refresh()
```

#### back() - 浏览器后退
```python
driver.back()
```

#### forward() - 浏览器前进
```python
driver.forward()
```

### 窗口管理

#### maximize_window() - 浏览器窗口最大化
```python
driver.maximize_window()
```

#### 窗口尺寸和位置控制
```python
# 设置窗口尺寸
driver.set_window_size(1024, 768)

# 设置窗口位置
driver.set_window_position(100, 100)

# 最小化窗口
driver.minimize_window()
```

### 窗口和标签页切换
```python
# 获取当前窗口句柄
current_handle = driver.current_window_handle

# 获取所有窗口句柄
all_handles = driver.window_handles

# 切换到新窗口（通常新窗口在列表的第二个位置）
driver.switch_to.window(all_handles[1])
```

### close() vs quit() - 深度辨析（重要考点）

这是非常重要的考点，需要深入理解两者的区别：

#### close() - 关闭当前窗口
```python
driver.close()  # 仅关闭当前聚焦的窗口
```

**特点**：
- 仅关闭当前聚焦的窗口
- 驱动进程（如chromedriver.exe）仍在后台运行
- 如果这是最后一个窗口，浏览器可能会退出，但驱动进程不会
- 可能导致资源泄漏

#### quit() - 关闭浏览器并终止驱动进程
```python
driver.quit()  # 关闭所有窗口并终止驱动进程
```

**特点**：
- 关闭由WebDriver会话打开的所有窗口
- 彻底终止浏览器驱动进程
- 执行完整的清理操作，释放所有占用的系统资源
- 在自动化测试脚本结束时，必须调用quit()来确保环境被正确清理

**最佳实践**：
```python
from selenium import webdriver

def test_example():
    driver = webdriver.Chrome()
    try:
        # 测试代码
        driver.get("https://example.com")
        # ... 其他操作
    except Exception as e:
        print(f"测试失败：{e}")
    finally:
        # 无论成功还是失败，都要清理资源
        driver.quit()  # 必须使用quit()而不是close()
```

### 截图功能
```python
# 截取整个页面
driver.save_screenshot("page_screenshot.png")

# 截取特定元素
element = driver.find_element(By.ID, "content")
element.screenshot("element_screenshot.png")
```

### 获取页面信息
```python
# 获取页面标题
title = driver.title
print(f"页面标题：{title}")

# 获取当前URL
current_url = driver.current_url
print(f"当前URL：{current_url}")

# 获取页面源码
page_source = driver.page_source
```

## 实用操作示例

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

def comprehensive_operations_demo():
    """综合操作演示"""
    driver = webdriver.Chrome()
    
    try:
        # 1. 页面导航
        driver.get("https://www.baidu.com")
        driver.maximize_window()
        
        # 2. 元素交互
        search_box = driver.find_element(By.ID, "kw")
        search_box.clear()
        search_box.send_keys("Selenium自动化测试")
        search_box.send_keys(Keys.RETURN)
        
        # 3. 获取页面信息
        print(f"页面标题：{driver.title}")
        print(f"当前URL：{driver.current_url}")
        
        # 4. 元素状态检查
        results = driver.find_elements(By.CSS_SELECTOR, ".result")
        if results:
            print(f"找到 {len(results)} 个搜索结果")
            for i, result in enumerate(results[:3]):  # 查看前3个结果
                if result.is_displayed():
                    print(f"结果 {i+1}：{result.text[:50]}...")
        
        # 5. 截图
        driver.save_screenshot("search_results.png")
        print("已保存截图")
        
    except Exception as e:
        print(f"操作失败：{e}")
        driver.save_screenshot("error_screenshot.png")
    finally:
        # 6. 正确清理资源
        driver.quit()  # 使用quit()而非close()

if __name__ == "__main__":
    comprehensive_operations_demo()
``` 