# 元素操作与浏览器控制

> 本节介绍Selenium WebDriver的元素操作方法和浏览器控制功能。

## 元素操作

### 输入和清除操作

#### .send_keys() - 输入文本
```python
# 基本输入
username_field = driver.find_element(By.ID, "username")
username_field.send_keys("testuser")

# 特殊按键输入
from selenium.webdriver.common.keys import Keys

search_box = driver.find_element(By.NAME, "q")
search_box.send_keys("selenium")
search_box.send_keys(Keys.RETURN)  # 回车键

# 组合键
search_box.send_keys(Keys.CONTROL, "a")  # Ctrl+A全选
search_box.send_keys(Keys.CONTROL, "c")  # Ctrl+C复制
```

#### .clear() - 清除文本
```python
password_field = driver.find_element(By.ID, "password")
password_field.clear()  # 清除现有内容
password_field.send_keys("newpassword")
```

### 获取元素信息

#### 获取属性
```python
element = driver.find_element(By.ID, "submit-btn")

# 获取属性值
class_name = element.get_attribute("class")
href = element.get_attribute("href")
value = element.get_attribute("value")
```

#### 获取文本
```python
# 获取元素文本内容
text_content = element.text

# 获取innerHTML
inner_html = element.get_attribute("innerHTML")
```

#### 获取尺寸和位置
```python
# 获取元素尺寸
size = element.size
width = size['width']
height = size['height']

# 获取元素位置
location = element.location
x = location['x']
y = location['y']
```

### 鼠标操作
```python
from selenium.webdriver.common.action_chains import ActionChains

actions = ActionChains(driver)

# 点击
element = driver.find_element(By.ID, "button")
actions.click(element).perform()

# 双击
actions.double_click(element).perform()

# 右键点击
actions.context_click(element).perform()

# 悬停
actions.move_to_element(element).perform()

# 拖动
source = driver.find_element(By.ID, "source")
target = driver.find_element(By.ID, "target")
actions.drag_and_drop(source, target).perform()
```

### 键盘操作
```python
from selenium.webdriver.common.keys import Keys

element = driver.find_element(By.ID, "input")

# 常用键盘操作
element.send_keys(Keys.ENTER)     # 回车
element.send_keys(Keys.TAB)       # Tab键
element.send_keys(Keys.ESCAPE)    # Esc键
element.send_keys(Keys.SPACE)     # 空格键

# 组合键
element.send_keys(Keys.CONTROL, "a")  # Ctrl+A
element.send_keys(Keys.CONTROL, "c")  # Ctrl+C
element.send_keys(Keys.CONTROL, "v")  # Ctrl+V
```

## 浏览器控制

### 页面导航
```python
# 打开页面
driver.get("https://www.example.com")

# 刷新页面
driver.refresh()

# 前进
driver.forward()

# 后退
driver.back()

# 关闭当前窗口
driver.close()

# 关闭浏览器
driver.quit()
```

### 窗口管理
```python
# 最大化窗口
driver.maximize_window()

# 最小化窗口
driver.minimize_window()

# 设置窗口尺寸
driver.set_window_size(1024, 768)

# 设置窗口位置
driver.set_window_position(100, 100)

# 获取窗口句柄
current_handle = driver.current_window_handle
all_handles = driver.window_handles

# 切换窗口
driver.switch_to.window(all_handles[1])
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

# 获取当前URL
current_url = driver.current_url

# 获取页面源码
page_source = driver.page_source
``` 