# Cookie操作

> 本节介绍Selenium中Cookie的操作方法，包括添加、获取、删除以及实际应用场景。

## Cookie基本操作

### 添加Cookie
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

### 获取Cookie
```python
# 获取指定名称的Cookie
session_cookie = driver.get_cookie('session_id')
print(f"会话Cookie: {session_cookie}")

# 获取所有Cookie
all_cookies = driver.get_cookies()
for cookie in all_cookies:
    print(f"Cookie: {cookie['name']} = {cookie['value']}")
```

### 删除Cookie
```python
# 删除指定名称的Cookie
driver.delete_cookie('session_id')

# 删除所有Cookie
driver.delete_all_cookies()
```

## Cookie应用场景

### 1. 跳过登录流程
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

### 2. 保存和恢复会话
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