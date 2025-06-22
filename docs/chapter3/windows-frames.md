# 窗口句柄与Frame切换

> 本节介绍如何处理多窗口和Frame框架切换，解决复杂页面结构的自动化测试问题。

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