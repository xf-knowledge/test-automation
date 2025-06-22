# Selenium 高级应用

> 本章深入探讨Selenium的高级功能，帮助处理复杂的Web应用场景。

## Select类操作：下拉框处理

### Select类介绍

下拉框是Web应用中常见的UI控件，Selenium提供了专门的Select类来处理`<select>`标签。

```python
from selenium.webdriver.support.ui import Select
from selenium import webdriver
from selenium.webdriver.common.by import By

# 初始化并定位下拉框
driver = webdriver.Chrome()
dropdown_element = driver.find_element(By.ID, "dropdown")
select = Select(dropdown_element)
```

### 三种选择方式

1. 根据索引选择 (select_by_index)
     ```python
     # HTML示例：
     # <select id="dropdown">
     #   <option value="opt1">选项1</option>
     #   <option value="opt2">选项2</option>
     #   <option value="opt3">选项3</option>
     # </select>
     
     select.select_by_index(0)  # 选择第一个选项（索引从0开始）
     select.select_by_index(2)  # 选择第三个选项
     ```
     
     **特点**：

     - ✅ 简单直接
     - ❌ 当选项顺序变化时容易失效
     - 💡 适用于选项固定且顺序不变的场景

2. 根据值选择 (select_by_value)
     ```python
     # 根据option标签的value属性选择
     select.select_by_value("opt2")  # 选择value="opt2"的选项
     ```

     **特点**：

     - ✅ 不依赖选项顺序
     - ✅ 相对稳定
     - ❌ 需要知道确切的value值
     - 💡 适用于value属性有意义的场景

3. 根据文本选择 (select_by_visible_text)
     ```python
     # 根据用户看到的文本选择
     select.select_by_visible_text("选项2")  # 选择显示文本为"选项2"的选项
     ```

     **特点**：

     - ✅ 最直观，符合用户操作习惯
     - ✅ 测试用例易读易维护
     - ❌ 对文本变化敏感
     - 💡 **推荐使用**，特别是文本相对稳定的场景

### Select类的其他功能

```python
# 获取所有选项
all_options = select.options
for option in all_options:
    print(f"文本: {option.text}, 值: {option.get_attribute('value')}")

# 获取当前选中的选项
selected_option = select.first_selected_option
print(f"当前选中: {selected_option.text}")

# 判断是否为多选下拉框
if select.is_multiple:
    print("这是多选下拉框")
    # 多选操作
    select.select_by_index(0)
    select.select_by_index(2)
    # 取消选择
    select.deselect_by_index(0)
else:
    print("这是单选下拉框")
```

## 等待机制详解

### 为什么需要等待？

现代Web应用大量使用AJAX、JavaScript等异步技术，页面元素的加载和更新往往是异步的。如果不合理处理等待，会导致：
- `NoSuchElementException`：元素还未加载就尝试定位
- `ElementNotInteractableException`：元素存在但不可交互
- 测试不稳定：时而成功时而失败

### 三种等待机制对比

| 等待类型     | 作用域 | 性能 | 灵活性 | 推荐程度       |
| ------------ | ------ | ---- | ------ | -------------- |
| **强制等待** | 局部   | 差   | 差     | ❌ 不推荐       |
| **隐式等待** | 全局   | 中等 | 中等   | ⚠️ 有限使用     |
| **显式等待** | 局部   | 好   | 高     | ✅ **强烈推荐** |

1. 强制等待 (time.sleep)
     ```python
     import time
     
     # 强制等待3秒
     time.sleep(3)
     ```

     **特点**：

    - ❌ **无条件等待**：不管元素是否已经可用，都要等待固定时间
    - ❌ **浪费时间**：如果元素1秒就加载完成，还要多等2秒
    - ❌ **不可靠**：如果3秒还不够，测试仍然会失败

    **适用场景**：

    - 🔧 **临时调试**：快速验证是否是时间问题
    - 🔧 **特殊需求**：某些动画效果必须等待固定时间

2. 隐式等待 (implicitly_wait)

     ```python
     # 设置隐式等待时间为10秒
     driver.implicitly_wait(10)

     # 之后的所有元素查找都会应用此等待
     element = driver.find_element(By.ID, "username")  # 最多等待10秒
     ```
 
     **工作原理**：
 
     - 当使用`find_element`或`find_elements`方法时
     - 如果元素立即找到，直接返回
     - 如果元素未找到，每隔一段时间重试
     - 直到找到元素或超时抛出`NoSuchElementException`
 
     **特点**：

     - ✅ **全局设置**：一次设置，所有元素查找都生效
     - ✅ **简单易用**：不需要额外代码
     - ✅ **智能等待**：元素找到就立即返回
     - ❌ **功能有限**：只能等待元素存在，不能等待其他条件

3. 显式等待 (WebDriverWait) - **推荐**

     ```python
     from selenium.webdriver.support.ui import WebDriverWait
     from selenium.webdriver.support import expected_conditions as EC

     # 创建WebDriverWait对象
     wait = WebDriverWait(driver, 10)  # 最多等待10秒

     # 等待元素出现
     element = wait.until(EC.presence_of_element_located((By.ID, "username")))

     # 等待元素可点击
     button = wait.until(EC.element_to_be_clickable((By.ID, "submit")))

     # 等待元素可见
     visible_element = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "message")))

     # 等待文本出现
     wait.until(EC.text_to_be_present_in_element((By.ID, "status"), "成功"))

     # 等待URL包含特定文本
     wait.until(EC.url_contains("dashboard"))
     ```

    **常用expected_conditions条件**：

    | 条件                            | 说明             | 示例                                                       |
    | ------------------------------- | ---------------- | ---------------------------------------------------------- |
    | `presence_of_element_located`   | 元素存在于DOM中  | `EC.presence_of_element_located((By.ID, "element"))`       |
    | `visibility_of_element_located` | 元素可见         | `EC.visibility_of_element_located((By.ID, "element"))`     |
    | `element_to_be_clickable`       | 元素可点击       | `EC.element_to_be_clickable((By.ID, "button"))`            |
    | `text_to_be_present_in_element` | 元素包含指定文本 | `EC.text_to_be_present_in_element((By.ID, "msg"), "成功")` |
    | `url_contains`                  | URL包含指定文本  | `EC.url_contains("dashboard")`                             |

    **特点**：

    - ✅ **灵活性最高**：可以等待各种条件
    - ✅ **性能最好**：条件满足立即返回
    - ✅ **可靠性强**：针对性等待，减少误判
    - ✅ **可调试性好**：明确的等待条件，便于排查问题

## 句柄与窗口切换

### 窗口句柄概念

每个浏览器窗口都有一个唯一的句柄（handle），通过句柄可以在不同窗口之间切换。

```python
# 获取当前窗口句柄
current_handle = driver.current_window_handle
print(f"当前窗口句柄: {current_handle}")

# 获取所有窗口句柄
all_handles = driver.window_handles
print(f"所有窗口句柄: {all_handles}")
```

### 窗口切换实例

```python
def handle_multiple_windows():
    """处理多窗口场景"""
    # 记录原窗口句柄
    original_window = driver.current_window_handle
    
    # 点击链接，打开新窗口
    link = driver.find_element(By.LINK_TEXT, "打开新窗口")
    link.click()
    
    # 等待新窗口出现
    wait = WebDriverWait(driver, 10)
    wait.until(lambda d: len(d.window_handles) > 1)
    
    # 切换到新窗口
    for handle in driver.window_handles:
        if handle != original_window:
            driver.switch_to.window(handle)
            break
    
    # 在新窗口中进行操作
    print(f"新窗口标题: {driver.title}")
    
    # 关闭新窗口
    driver.close()
    
    # 切换回原窗口
    driver.switch_to.window(original_window)
    print(f"返回原窗口: {driver.title}")
```

### 多标签页管理

```python
def manage_multiple_tabs():
    """管理多个标签页"""
    # 打开新标签页
    driver.execute_script("window.open('https://www.example.com', '_blank');")
    
    # 切换到新标签页
    driver.switch_to.window(driver.window_handles[-1])
    
    # 操作新标签页
    print(f"新标签页URL: {driver.current_url}")
    
    # 切换回第一个标签页
    driver.switch_to.window(driver.window_handles[0])
```

## 多表单Frame切换

### Frame概念

Frame是HTML中嵌入另一个HTML文档的技术，包括`<frame>`、`<iframe>`等标签。

### Frame切换方法

#### 1. 根据Frame的name或id切换
```python
# 切换到name="loginFrame"的frame
driver.switch_to.frame("loginFrame")

# 切换到id="content-frame"的frame
driver.switch_to.frame("content-frame")
```

#### 2. 根据Frame元素切换
```python
# 先定位frame元素，再切换
frame_element = driver.find_element(By.TAG_NAME, "iframe")
driver.switch_to.frame(frame_element)
```

#### 3. 根据Frame索引切换
```python
# 切换到第一个frame（索引从0开始）
driver.switch_to.frame(0)

# 切换到第二个frame
driver.switch_to.frame(1)
```

### Frame切换实例

```python
def handle_nested_frames():
    """处理嵌套Frame"""
    try:
        # 切换到父Frame
        driver.switch_to.frame("parentFrame")
        print("已切换到父Frame")
        
        # 切换到子Frame
        driver.switch_to.frame("childFrame")
        print("已切换到子Frame")
        
        # 在子Frame中定位元素
        element = driver.find_element(By.ID, "inner-element")
        element.click()
        
        # 切换到父Frame
        driver.switch_to.parent_frame()
        print("已切换到父Frame")
        
        # 切换回主文档
        driver.switch_to.default_content()
        print("已切换回主文档")
        
    except Exception as e:
        print(f"Frame切换失败: {e}")
        # 发生异常时，确保回到主文档
        driver.switch_to.default_content()
```

### Frame切换最佳实践

```python
def safe_frame_operation(frame_locator, operation):
    """安全的Frame操作"""
    try:
        # 切换到Frame
        driver.switch_to.frame(frame_locator)
        
        # 执行操作
        operation()
        
    finally:
        # 无论成功失败，都要切换回主文档
        driver.switch_to.default_content()

# 使用示例
def click_button_in_frame():
    button = driver.find_element(By.ID, "submit")
    button.click()

safe_frame_operation("loginFrame", click_button_in_frame)
```

## Cookie操作

### Cookie基本操作

#### 添加Cookie
```python
# 添加单个Cookie
driver.add_cookie({
    'name': 'session_id',
    'value': 'abc123',
    'domain': 'example.com',
    'path': '/',
    'secure': False
})

# 添加带过期时间的Cookie
import time
expiry_time = int(time.time()) + 3600  # 1小时后过期

driver.add_cookie({
    'name': 'user_token',
    'value': 'token123',
    'expiry': expiry_time
})
```

#### 获取Cookie
```python
# 获取指定名称的Cookie
session_cookie = driver.get_cookie('session_id')
print(f"会话Cookie: {session_cookie}")

# 获取所有Cookie
all_cookies = driver.get_cookies()
for cookie in all_cookies:
    print(f"Cookie: {cookie['name']} = {cookie['value']}")
```

#### 删除Cookie
```python
# 删除指定名称的Cookie
driver.delete_cookie('session_id')

# 删除所有Cookie
driver.delete_all_cookies()
```

### Cookie应用场景

#### 1. 跳过登录流程
```python
def skip_login_with_cookie():
    """使用Cookie跳过登录"""
    # 先访问登录页面，获取domain
    driver.get("https://example.com/login")
    
    # 添加登录状态的Cookie
    driver.add_cookie({
        'name': 'user_session',
        'value': 'logged_in_token',
        'domain': 'example.com'
    })
    
    # 刷新页面，应该直接进入登录后状态
    driver.refresh()
    
    # 验证登录状态
    assert "dashboard" in driver.current_url
```

#### 2. 保存和恢复会话
```python
import json

def save_cookies_to_file(filename):
    """保存Cookie到文件"""
    cookies = driver.get_cookies()
    with open(filename, 'w') as f:
        json.dump(cookies, f, indent=2)

def load_cookies_from_file(filename):
    """从文件加载Cookie"""
    with open(filename, 'r') as f:
        cookies = json.load(f)
    
    for cookie in cookies:
        driver.add_cookie(cookie)

# 使用示例
def test_with_saved_session():
    # 执行登录
    login()
    
    # 保存登录状态的Cookie
    save_cookies_to_file('login_cookies.json')
    
    # 下次测试时加载Cookie
    driver.get("https://example.com")
    load_cookies_from_file('login_cookies.json')
    driver.refresh()
```