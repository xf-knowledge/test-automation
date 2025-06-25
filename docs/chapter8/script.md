# 测试脚本编程题（5题）

!!! tip "编程提示"
    - 认真分析题目要求，理解测试场景
    - 注意代码的规范性和可读性
    - 包含必要的异常处理和日志记录
    - 考虑实际项目中的最佳实践

---

## 题目1：基础登录自动化测试（20分）

**题目要求：**
编写一个完整的登录页面自动化测试脚本，要求包含以下功能：
1. 使用Page Object模式设计
2. 测试有效登录和无效登录场景
3. 使用pytest框架和参数化测试
4. 包含适当的等待和异常处理
5. 集成日志记录功能

**技术要求：**
<ul>
<li>使用webdriver-manager管理驱动</li>
<li>显式等待处理动态元素</li>
<li>测试数据外部化（使用参数化）</li>
</ul>

<details>
<summary>🔍 点击查看参考答案</summary>

```python
# conftest.py
import pytest
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import logging

@pytest.fixture(scope="session")
def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('test_execution.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

@pytest.fixture(scope="function")
def driver():
    # 使用webdriver-manager自动管理驱动
    service = Service(ChromeDriverManager().install())
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')  # 无头模式，适合CI/CD
    driver = webdriver.Chrome(service=service, options=options)
    driver.implicitly_wait(10)
    driver.maximize_window()
    
    yield driver
    
    driver.quit()

# page_objects.py
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import logging

class LoginPageElements:
    """对象库层：定义页面元素"""
    USERNAME_INPUT = (By.ID, "username")
    PASSWORD_INPUT = (By.ID, "password")
    LOGIN_BUTTON = (By.ID, "loginBtn")
    ERROR_MESSAGE = (By.CLASS_NAME, "error-message")
    SUCCESS_MESSAGE = (By.CLASS_NAME, "welcome-message")
    LOGOUT_BUTTON = (By.ID, "logoutBtn")

class LoginPageActions:
    """操作层：封装页面操作"""
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
        self.logger = logging.getLogger(__name__)
    
    def navigate_to_login_page(self, url="https://example.com/login"):
        """导航到登录页面"""
        self.logger.info(f"导航到登录页面: {url}")
        self.driver.get(url)
    
    def enter_username(self, username):
        """输入用户名"""
        self.logger.info(f"输入用户名: {username}")
        username_field = self.wait.until(
            EC.presence_of_element_located(LoginPageElements.USERNAME_INPUT)
        )
        username_field.clear()
        username_field.send_keys(username)
    
    def enter_password(self, password):
        """输入密码"""
        self.logger.info("输入密码")
        password_field = self.wait.until(
            EC.presence_of_element_located(LoginPageElements.PASSWORD_INPUT)
        )
        password_field.clear()
        password_field.send_keys(password)
    
    def click_login_button(self):
        """点击登录按钮"""
        self.logger.info("点击登录按钮")
        login_button = self.wait.until(
            EC.element_to_be_clickable(LoginPageElements.LOGIN_BUTTON)
        )
        login_button.click()
    
    def get_error_message(self):
        """获取错误信息"""
        try:
            error_element = self.wait.until(
                EC.presence_of_element_located(LoginPageElements.ERROR_MESSAGE)
            )
            return error_element.text
        except:
            return None
    
    def is_login_successful(self):
        """检查登录是否成功"""
        try:
            self.wait.until(
                EC.presence_of_element_located(LoginPageElements.SUCCESS_MESSAGE)
            )
            return True
        except:
            return False
    
    def login(self, username, password):
        """完整的登录操作"""
        self.logger.info(f"执行登录操作 - 用户名: {username}")
        self.enter_username(username)
        self.enter_password(password)
        self.click_login_button()

# test_login.py
import pytest
from page_objects import LoginPageActions
import logging

class TestLogin:
    """业务层：测试用例"""
    
    @pytest.fixture(autouse=True)
    def setup(self, driver, setup_logging):
        self.driver = driver
        self.login_page = LoginPageActions(driver)
        self.logger = logging.getLogger(__name__)
    
    @pytest.mark.parametrize("username,password,expected_result", [
        ("admin", "admin123", "success"),
        ("user", "user123", "success"),
        ("admin", "wrongpass", "error"),
        ("", "admin123", "error"),
        ("admin", "", "error"),
        ("nonexistent", "123456", "error")
    ])
    def test_login_scenarios(self, username, password, expected_result):
        """参数化测试不同登录场景"""
        self.logger.info(f"=== 开始测试登录场景: {username}/{password} ===")
        
        # 导航到登录页面
        self.login_page.navigate_to_login_page()
        
        # 执行登录操作
        self.login_page.login(username, password)
        
        # 验证结果
        if expected_result == "success":
            assert self.login_page.is_login_successful(), f"用户 {username} 登录应该成功"
            self.logger.info("登录成功验证通过")
        else:
            error_msg = self.login_page.get_error_message()
            assert error_msg is not None, "应该显示错误信息"
            self.logger.info(f"登录失败验证通过，错误信息: {error_msg}")
    
    def test_empty_credentials(self):
        """测试空凭据场景"""
        self.logger.info("=== 测试空凭据场景 ===")
        
        self.login_page.navigate_to_login_page()
        self.login_page.click_login_button()  # 直接点击登录，不输入任何信息
        
        error_msg = self.login_page.get_error_message()
        assert error_msg is not None, "空凭据应该显示错误信息"
        self.logger.info(f"空凭据测试通过: {error_msg}")

if __name__ == "__main__":
    pytest.main(["-v", "--html=login_test_report.html", "--self-contained-html"])
```

<p><strong>评分要点：</strong></p>
<ul>
<li>Page Object模式实现（5分）</li>
<li>参数化测试使用（3分）</li>
<li>等待机制处理（4分）</li>
<li>异常处理（3分）</li>
<li>日志记录（3分）</li>
<li>代码规范性（2分）</li>
</ul>
</details>

---

## 题目2：多窗口操作自动化测试（15分）

**题目要求：**
编写一个处理多窗口操作的自动化测试脚本：
1. 在主窗口点击链接打开新窗口
2. 切换到新窗口进行操作
3. 关闭新窗口并返回主窗口
4. 验证窗口切换的正确性
5. 包含完整的窗口句柄管理

<details>
<summary>🔍 点击查看参考答案</summary>

```python
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import logging

class WindowManager:
    """窗口管理类"""
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
        self.logger = logging.getLogger(__name__)
        self.main_window = None
    
    def save_main_window(self):
        """保存主窗口句柄"""
        self.main_window = self.driver.current_window_handle
        self.logger.info(f"保存主窗口句柄: {self.main_window}")
    
    def open_new_window(self, link_locator):
        """点击链接打开新窗口"""
        current_windows = len(self.driver.window_handles)
        self.logger.info(f"当前窗口数量: {current_windows}")
        
        # 点击会打开新窗口的链接
        link = self.wait.until(EC.element_to_be_clickable(link_locator))
        link.click()
        
        # 等待新窗口打开
        self.wait.until(EC.number_of_windows_to_be(current_windows + 1))
        self.logger.info("新窗口已打开")
    
    def switch_to_new_window(self):
        """切换到新窗口"""
        all_windows = self.driver.window_handles
        for window in all_windows:
            if window != self.main_window:
                self.driver.switch_to.window(window)
                self.logger.info(f"切换到新窗口: {window}")
                return window
        raise Exception("未找到新窗口")
    
    def switch_to_main_window(self):
        """切换回主窗口"""
        self.driver.switch_to.window(self.main_window)
        self.logger.info("切换回主窗口")
    
    def close_current_window(self):
        """关闭当前窗口"""
        current_window = self.driver.current_window_handle
        self.driver.close()
        self.logger.info(f"关闭窗口: {current_window}")
    
    def get_current_window_title(self):
        """获取当前窗口标题"""
        return self.driver.title

class TestMultiWindow:
    """多窗口测试类"""
    
    @pytest.fixture(autouse=True)
    def setup(self, driver):
        self.driver = driver
        self.window_manager = WindowManager(driver)
        self.logger = logging.getLogger(__name__)
    
    def test_multi_window_operations(self):
        """测试多窗口操作流程"""
        self.logger.info("=== 开始多窗口操作测试 ===")
        
        # 1. 导航到主页面
        self.driver.get("https://example.com/main")
        self.window_manager.save_main_window()
        main_title = self.window_manager.get_current_window_title()
        self.logger.info(f"主窗口标题: {main_title}")
        
        # 2. 打开新窗口
        new_window_link = (By.ID, "openNewWindow")
        self.window_manager.open_new_window(new_window_link)
        
        # 3. 切换到新窗口
        new_window_handle = self.window_manager.switch_to_new_window()
        new_window_title = self.window_manager.get_current_window_title()
        self.logger.info(f"新窗口标题: {new_window_title}")
        
        # 4. 在新窗口中执行操作
        self.perform_operations_in_new_window()
        
        # 5. 关闭新窗口
        self.window_manager.close_current_window()
        
        # 6. 切换回主窗口
        self.window_manager.switch_to_main_window()
        current_title = self.window_manager.get_current_window_title()
        
        # 7. 验证回到主窗口
        assert current_title == main_title, "未正确返回主窗口"
        assert len(self.driver.window_handles) == 1, "应该只剩一个窗口"
        self.logger.info("多窗口操作测试完成")
    
    def perform_operations_in_new_window(self):
        """在新窗口中执行具体操作"""
        self.logger.info("在新窗口中执行操作")
        
        # 示例：在新窗口中填写表单
        try:
            name_input = WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.ID, "name"))
            )
            name_input.send_keys("测试用户")
            
            email_input = self.driver.find_element(By.ID, "email")
            email_input.send_keys("test@example.com")
            
            submit_btn = self.driver.find_element(By.ID, "submit")
            submit_btn.click()
            
            self.logger.info("新窗口操作完成")
        except Exception as e:
            self.logger.warning(f"新窗口操作失败: {str(e)}")
    
    def test_multiple_new_windows(self):
        """测试打开多个新窗口的场景"""
        self.logger.info("=== 测试多个新窗口场景 ===")
        
        self.driver.get("https://example.com/main")
        self.window_manager.save_main_window()
        
        # 打开两个新窗口
        for i in range(2):
            link_locator = (By.CSS_SELECTOR, f".open-window-{i+1}")
            self.window_manager.open_new_window(link_locator)
        
        # 验证窗口数量
        assert len(self.driver.window_handles) == 3, "应该有3个窗口"
        
        # 逐个处理新窗口
        all_windows = self.driver.window_handles
        for window in all_windows:
            if window != self.window_manager.main_window:
                self.driver.switch_to.window(window)
                title = self.driver.title
                self.logger.info(f"处理窗口: {title}")
                self.driver.close()
        
        # 返回主窗口
        self.window_manager.switch_to_main_window()
        assert len(self.driver.window_handles) == 1, "最终应该只剩主窗口"
```

<p><strong>评分要点：</strong></p>
<ul>
<li>窗口句柄管理（4分）</li>
<li>窗口切换逻辑（4分）</li>
<li>等待机制（3分）</li>
<li>异常处理（2分）</li>
<li>代码组织性（2分）</li>
</ul>
</details>

---

## 题目3：数据驱动测试实现（15分）

**题目要求：**
设计一个数据驱动的搜索功能测试：
1. 从Excel文件读取测试数据
2. 使用不同搜索关键词进行测试
3. 验证搜索结果的正确性
4. 生成详细的测试报告
5. 处理数据文件异常情况

<details>
<summary>🔍 点击查看参考答案</summary>

```python
# data_manager.py
import pandas as pd
import logging
from typing import List, Dict

class TestDataManager:
    """测试数据管理类"""
    
    def __init__(self, data_file_path: str):
        self.data_file_path = data_file_path
        self.logger = logging.getLogger(__name__)
    
    def load_test_data(self) -> List[Dict]:
        """从Excel文件加载测试数据"""
        try:
            self.logger.info(f"加载测试数据文件: {self.data_file_path}")
            df = pd.read_excel(self.data_file_path)
            
            # 转换为字典列表
            test_data = df.to_dict('records')
            self.logger.info(f"成功加载 {len(test_data)} 条测试数据")
            return test_data
            
        except FileNotFoundError:
            self.logger.error(f"测试数据文件未找到: {self.data_file_path}")
            raise
        except Exception as e:
            self.logger.error(f"加载测试数据失败: {str(e)}")
            raise
    
    def validate_data_structure(self, data: List[Dict]) -> bool:
        """验证数据结构"""
        required_fields = ['search_term', 'expected_results', 'min_results']
        
        for i, record in enumerate(data):
            for field in required_fields:
                if field not in record:
                    self.logger.error(f"第{i+1}行数据缺少必要字段: {field}")
                    return False
        
        self.logger.info("数据结构验证通过")
        return True

# search_page.py
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import logging

class SearchPageElements:
    SEARCH_INPUT = (By.ID, "searchInput")
    SEARCH_BUTTON = (By.ID, "searchBtn")
    SEARCH_RESULTS = (By.CLASS_NAME, "search-result")
    RESULT_TITLE = (By.CLASS_NAME, "result-title")
    NO_RESULTS_MESSAGE = (By.CLASS_NAME, "no-results")

class SearchPageActions:
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
        self.logger = logging.getLogger(__name__)
    
    def navigate_to_search_page(self, url="https://example.com/search"):
        """导航到搜索页面"""
        self.logger.info(f"导航到搜索页面: {url}")
        self.driver.get(url)
    
    def perform_search(self, search_term: str):
        """执行搜索"""
        self.logger.info(f"搜索关键词: {search_term}")
        
        # 清空并输入搜索词
        search_input = self.wait.until(
            EC.presence_of_element_located(SearchPageElements.SEARCH_INPUT)
        )
        search_input.clear()
        search_input.send_keys(search_term)
        
        # 执行搜索
        search_input.send_keys(Keys.ENTER)
        # 或者点击搜索按钮
        # search_button = self.driver.find_element(*SearchPageElements.SEARCH_BUTTON)
        # search_button.click()
    
    def get_search_results(self) -> List[str]:
        """获取搜索结果"""
        try:
            # 等待搜索结果加载
            self.wait.until(
                EC.presence_of_element_located(SearchPageElements.SEARCH_RESULTS)
            )
            
            results = self.driver.find_elements(*SearchPageElements.SEARCH_RESULTS)
            result_texts = []
            
            for result in results:
                try:
                    title_element = result.find_element(*SearchPageElements.RESULT_TITLE)
                    result_texts.append(title_element.text)
                except:
                    result_texts.append(result.text)
            
            self.logger.info(f"找到 {len(result_texts)} 个搜索结果")
            return result_texts
            
        except:
            # 检查是否有"无结果"消息
            try:
                self.driver.find_element(*SearchPageElements.NO_RESULTS_MESSAGE)
                self.logger.info("搜索无结果")
                return []
            except:
                self.logger.warning("搜索结果页面加载异常")
                return []
    
    def verify_search_results(self, results: List[str], search_term: str) -> bool:
        """验证搜索结果是否包含搜索词"""
        if not results:
            return False
        
        relevant_count = 0
        for result in results:
            if search_term.lower() in result.lower():
                relevant_count += 1
        
        relevance_ratio = relevant_count / len(results)
        self.logger.info(f"搜索结果相关性: {relevance_ratio:.2%}")
        
        return relevance_ratio >= 0.7  # 70%的结果应该相关

# test_search_data_driven.py
import pytest
from data_manager import TestDataManager
from search_page import SearchPageActions
import logging

class TestSearchDataDriven:
    """数据驱动搜索测试"""
    
    @pytest.fixture(scope="class")
    def test_data(self):
        """加载测试数据"""
        data_manager = TestDataManager("test_data/search_test_data.xlsx")
        data = data_manager.load_test_data()
        assert data_manager.validate_data_structure(data), "测试数据结构验证失败"
        return data
    
    @pytest.fixture(autouse=True)
    def setup(self, driver):
        self.driver = driver
        self.search_page = SearchPageActions(driver)
        self.logger = logging.getLogger(__name__)
    
    def test_search_with_data(self, test_data):
        """使用测试数据进行搜索测试"""
        test_results = []
        
        for i, data_row in enumerate(test_data):
            self.logger.info(f"=== 执行第 {i+1} 个搜索测试 ===")
            
            search_term = data_row['search_term']
            expected_results = data_row['expected_results']
            min_results = int(data_row['min_results'])
            
            try:
                # 执行搜索
                self.search_page.navigate_to_search_page()
                self.search_page.perform_search(search_term)
                results = self.search_page.get_search_results()
                
                # 验证结果数量
                results_count_valid = len(results) >= min_results
                
                # 验证结果相关性
                relevance_valid = self.search_page.verify_search_results(results, search_term)
                
                # 记录测试结果
                test_result = {
                    'search_term': search_term,
                    'expected_results': expected_results,
                    'actual_results': len(results),
                    'min_results': min_results,
                    'results_count_valid': results_count_valid,
                    'relevance_valid': relevance_valid,
                    'overall_pass': results_count_valid and relevance_valid
                }
                
                test_results.append(test_result)
                
                # 断言
                assert results_count_valid, f"搜索'{search_term}'结果数量不足，期望至少{min_results}个，实际{len(results)}个"
                assert relevance_valid, f"搜索'{search_term}'结果相关性不足"
                
                self.logger.info(f"搜索测试通过: {search_term}")
                
            except Exception as e:
                self.logger.error(f"搜索测试失败: {search_term}, 错误: {str(e)}")
                test_results.append({
                    'search_term': search_term,
                    'error': str(e),
                    'overall_pass': False
                })
                raise
        
        # 生成测试报告摘要
        self.generate_test_summary(test_results)
    
    def generate_test_summary(self, test_results):
        """生成测试摘要"""
        total_tests = len(test_results)
        passed_tests = sum(1 for result in test_results if result.get('overall_pass', False))
        
        self.logger.info(f"=== 搜索测试摘要 ===")
        self.logger.info(f"总测试数: {total_tests}")
        self.logger.info(f"通过数: {passed_tests}")
        self.logger.info(f"失败数: {total_tests - passed_tests}")
        self.logger.info(f"通过率: {passed_tests/total_tests:.2%}")

# 创建测试数据文件 (search_test_data.xlsx)
# 示例数据结构：
"""
search_term    | expected_results | min_results
Python         | 编程语言相关      | 5
Selenium       | 自动化测试相关    | 3
机器学习        | AI相关          | 4
"""
```

<p><strong>评分要点：</strong></p>
<ul>
<li>数据文件读取（3分）</li>
<li>数据结构验证（3分）</li>
<li>搜索功能测试（4分）</li>
<li>结果验证逻辑（3分）</li>
<li>异常处理（2分）</li>
</ul>
</details>

---

## 题目4：完整的E2E测试流程（25分）

**题目要求：**
设计一个完整的电商网站端到端测试流程：
1. 用户注册/登录
2. 商品搜索和浏览
3. 添加商品到购物车
4. 结算和支付流程
5. 订单确认
6. 全流程使用PO模式和数据驱动
7. 包含详细的测试报告和截图

<details>
<summary>🔍 点击查看参考答案</summary>

<p>由于篇幅限制，这里提供核心框架代码：</p>

```python
# e2e_test_framework.py
import pytest
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
import logging
from datetime import datetime
import os

class E2ETestFramework:
    """E2E测试框架基类"""
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 15)
        self.logger = logging.getLogger(__name__)
        self.screenshots_dir = "screenshots"
        os.makedirs(self.screenshots_dir, exist_ok=True)
    
    def take_screenshot(self, step_name):
        """截图功能"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{step_name}_{timestamp}.png"
        filepath = os.path.join(self.screenshots_dir, filename)
        self.driver.save_screenshot(filepath)
        self.logger.info(f"截图保存: {filepath}")
        return filepath

class UserAccountPage(E2ETestFramework):
    """用户账户页面"""
    
    def register_user(self, user_data):
        """用户注册"""
        self.logger.info("开始用户注册")
        # 注册逻辑实现
        self.take_screenshot("user_registration")
    
    def login_user(self, username, password):
        """用户登录"""
        self.logger.info(f"用户登录: {username}")
        # 登录逻辑实现
        self.take_screenshot("user_login")

class ProductPage(E2ETestFramework):
    """商品页面"""
    
    def search_product(self, keyword):
        """搜索商品"""
        self.logger.info(f"搜索商品: {keyword}")
        # 搜索逻辑实现
        self.take_screenshot("product_search")
    
    def add_to_cart(self, product_id):
        """添加到购物车"""
        self.logger.info(f"添加商品到购物车: {product_id}")
        # 添加购物车逻辑
        self.take_screenshot("add_to_cart")

class CheckoutPage(E2ETestFramework):
    """结算页面"""
    
    def proceed_to_checkout(self):
        """进入结算流程"""
        self.logger.info("开始结算流程")
        self.take_screenshot("checkout_start")
    
    def complete_payment(self, payment_info):
        """完成支付"""
        self.logger.info("执行支付操作")
        self.take_screenshot("payment_complete")

class TestE2EWorkflow:
    """完整E2E测试流程"""
    
    @pytest.fixture(autouse=True)
    def setup(self, driver):
        self.driver = driver
        self.user_page = UserAccountPage(driver)
        self.product_page = ProductPage(driver)
        self.checkout_page = CheckoutPage(driver)
        self.logger = logging.getLogger(__name__)
    
    def test_complete_purchase_workflow(self):
        """完整的购买流程测试"""
        self.logger.info("=== 开始E2E购买流程测试 ===")
        
        try:
            # 1. 用户注册/登录
            self.user_page.login_user("testuser", "password123")
            
            # 2. 搜索商品
            self.product_page.search_product("手机")
            
            # 3. 添加商品到购物车
            self.product_page.add_to_cart("product_001")
            
            # 4. 结算流程
            self.checkout_page.proceed_to_checkout()
            
            # 5. 支付
            payment_info = {"card": "1234567890123456", "cvv": "123"}
            self.checkout_page.complete_payment(payment_info)
            
            # 6. 验证订单
            self.verify_order_completion()
            
            self.logger.info("E2E测试流程完成")
            
        except Exception as e:
            self.logger.error(f"E2E测试失败: {str(e)}")
            self.user_page.take_screenshot("test_failure")
            raise
    
    def verify_order_completion(self):
        """验证订单完成"""
        # 订单验证逻辑
        self.logger.info("订单完成验证通过")
```

<p><strong>评分要点：</strong></p>
<ul>
<li>完整流程设计（8分）</li>
<li>PO模式应用（5分）</li>
<li>截图功能（3分）</li>
<li>异常处理（4分）</li>
<li>测试数据管理（3分）</li>
<li>代码组织性（2分）</li>
</ul>
</details>

---

## 题目5：性能监控与报告生成（20分）

**题目要求：**
开发一个自动化测试性能监控和报告生成系统：
1. 监控页面加载时间
2. 记录操作响应时间
3. 检测页面性能指标
4. 生成HTML格式的详细报告
5. 集成邮件通知功能

<details>
<summary>🔍 点击查看参考答案</summary>

```python
# performance_monitor.py
import time
import json
from datetime import datetime
import logging
from typing import Dict, List
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart

class PerformanceMonitor:
    """性能监控类"""
    
    def __init__(self, driver):
        self.driver = driver
        self.logger = logging.getLogger(__name__)
        self.performance_data = []
        self.start_time = None
    
    def start_timing(self, operation_name: str):
        """开始计时"""
        self.start_time = time.time()
        self.logger.info(f"开始监控操作: {operation_name}")
    
    def end_timing(self, operation_name: str) -> float:
        """结束计时并记录"""
        if self.start_time is None:
            raise ValueError("必须先调用start_timing()")
        
        end_time = time.time()
        duration = end_time - self.start_time
        
        performance_record = {
            'operation': operation_name,
            'duration': duration,
            'timestamp': datetime.now().isoformat(),
            'url': self.driver.current_url,
            'page_title': self.driver.title
        }
        
        self.performance_data.append(performance_record)
        self.logger.info(f"操作 '{operation_name}' 耗时: {duration:.2f}秒")
        return duration
    
    def get_page_load_time(self) -> float:
        """获取页面加载时间"""
        navigation_start = self.driver.execute_script(
            "return window.performance.timing.navigationStart"
        )
        load_event_end = self.driver.execute_script(
            "return window.performance.timing.loadEventEnd"
        )
        
        if load_event_end == 0:
            return -1  # 页面还在加载
        
        load_time = (load_event_end - navigation_start) / 1000.0
        self.logger.info(f"页面加载时间: {load_time:.2f}秒")
        return load_time
    
    def get_page_performance_metrics(self) -> Dict:
        """获取页面性能指标"""
        try:
            metrics = self.driver.execute_script("""
                var timing = window.performance.timing;
                var navigation = window.performance.getEntriesByType('navigation')[0];
                
                return {
                    'dns_lookup': timing.domainLookupEnd - timing.domainLookupStart,
                    'tcp_connect': timing.connectEnd - timing.connectStart,
                    'request_response': timing.responseEnd - timing.requestStart,
                    'dom_processing': timing.domComplete - timing.domLoading,
                    'page_load_time': timing.loadEventEnd - timing.navigationStart,
                    'first_paint': navigation ? navigation.loadEventEnd - navigation.fetchStart : null
                };
            """)
            
            # 转换为秒
            for key in metrics:
                if metrics[key] and metrics[key] > 0:
                    metrics[key] = metrics[key] / 1000.0
            
            return metrics
        except Exception as e:
            self.logger.error(f"获取性能指标失败: {str(e)}")
            return {}

class ReportGenerator:
    """报告生成器"""
    
    def __init__(self, performance_data: List[Dict]):
        self.performance_data = performance_data
        self.logger = logging.getLogger(__name__)
    
    def generate_html_report(self, output_file: str = "performance_report.html"):
        """生成HTML报告"""
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>自动化测试性能报告</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { background-color: #f0f0f0; padding: 10px; text-align: center; }
                .summary { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
                .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .data-table th { background-color: #f2f2f2; }
                .slow { background-color: #ffebee; }
                .normal { background-color: #e8f5e8; }
                .chart { margin: 20px 0; text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>自动化测试性能报告</h1>
                <p>生成时间: {report_time}</p>
            </div>
            
            <div class="summary">
                <h2>性能摘要</h2>
                <p>总操作数: {total_operations}</p>
                <p>平均响应时间: {avg_response_time:.2f}秒</p>
                <p>最慢操作: {slowest_operation}</p>
                <p>最快操作: {fastest_operation}</p>
            </div>
            
            <div class="details">
                <h2>详细数据</h2>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>操作名称</th>
                            <th>耗时(秒)</th>
                            <th>时间戳</th>
                            <th>页面URL</th>
                            <th>页面标题</th>
                        </tr>
                    </thead>
                    <tbody>
                        {table_rows}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
        """
        
        # 计算统计数据
        if not self.performance_data:
            self.logger.warning("没有性能数据可生成报告")
            return
        
        durations = [item['duration'] for item in self.performance_data]
        avg_duration = sum(durations) / len(durations)
        slowest = max(self.performance_data, key=lambda x: x['duration'])
        fastest = min(self.performance_data, key=lambda x: x['duration'])
        
        # 生成表格行
        table_rows = ""
        for item in self.performance_data:
            row_class = "slow" if item['duration'] > avg_duration * 1.5 else "normal"
            table_rows += f"""
                <tr class="{row_class}">
                    <td>{item['operation']}</td>
                    <td>{item['duration']:.2f}</td>
                    <td>{item['timestamp']}</td>
                    <td>{item['url']}</td>
                    <td>{item['page_title']}</td>
                </tr>
            """
        
        # 填充模板
        html_content = html_template.format(
            report_time=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            total_operations=len(self.performance_data),
            avg_response_time=avg_duration,
            slowest_operation=f"{slowest['operation']} ({slowest['duration']:.2f}s)",
            fastest_operation=f"{fastest['operation']} ({fastest['duration']:.2f}s)",
            table_rows=table_rows
        )
        
        # 写入文件
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        self.logger.info(f"性能报告已生成: {output_file}")
        return output_file

class EmailNotifier:
    """邮件通知类"""
    
    def __init__(self, smtp_server: str, smtp_port: int, username: str, password: str):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.username = username
        self.password = password
        self.logger = logging.getLogger(__name__)
    
    def send_report(self, report_file: str, recipients: List[str], subject: str = "自动化测试性能报告"):
        """发送报告邮件"""
        try:
            msg = MimeMultipart()
            msg['From'] = self.username
            msg['To'] = ", ".join(recipients)
            msg['Subject'] = subject
            
            # 邮件正文
            body = f"""
            自动化测试性能报告已生成，请查看附件。
            
            报告生成时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
            """
            msg.attach(MimeText(body, 'plain', 'utf-8'))
            
            # 添加附件
            with open(report_file, 'r', encoding='utf-8') as f:
                attachment = MimeText(f.read(), 'html', 'utf-8')
                attachment.add_header('Content-Disposition', f'attachment; filename="{report_file}"')
                msg.attach(attachment)
            
            # 发送邮件
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.username, self.password)
            server.send_message(msg)
            server.quit()
            
            self.logger.info(f"报告邮件已发送至: {recipients}")
            
        except Exception as e:
            self.logger.error(f"发送邮件失败: {str(e)}")

# 测试用例
class TestWithPerformanceMonitoring:
    """带性能监控的测试类"""
    
    @pytest.fixture(autouse=True)
    def setup(self, driver):
        self.driver = driver
        self.monitor = PerformanceMonitor(driver)
        self.logger = logging.getLogger(__name__)
    
    def test_performance_monitoring(self):
        """性能监控测试示例"""
        # 监控页面加载
        self.monitor.start_timing("页面加载")
        self.driver.get("https://example.com")
        self.monitor.end_timing("页面加载")
        
        # 监控登录操作
        self.monitor.start_timing("用户登录")
        # 执行登录操作
        time.sleep(2)  # 模拟操作时间
        self.monitor.end_timing("用户登录")
        
        # 监控搜索操作
        self.monitor.start_timing("商品搜索")
        # 执行搜索操作
        time.sleep(1.5)  # 模拟操作时间
        self.monitor.end_timing("商品搜索")
        
        # 生成报告
        generator = ReportGenerator(self.monitor.performance_data)
        report_file = generator.generate_html_report()
        
        # 发送邮件通知（可选）
        # notifier = EmailNotifier("smtp.gmail.com", 587, "user@gmail.com", "password")
        # notifier.send_report(report_file, ["admin@company.com"])
        
        assert len(self.monitor.performance_data) > 0, "应该记录性能数据"
```

<p><strong>评分要点：</strong></p>
<ul>
<li>性能数据收集（5分）</li>
<li>时间监控功能（4分）</li>
<li>HTML报告生成（5分）</li>
<li>数据分析统计（3分）</li>
<li>邮件通知功能（3分）</li>
</ul>
</details>

---

!!! success "测试脚本编程题完成"
    🎉 恭喜您完成了全部5道测试脚本编程题！
    
    **编程要点总结：**
    - 熟练掌握Page Object模式的三层架构
    - 能够处理复杂的异步操作和等待机制
    - 具备数据驱动测试的设计和实现能力
    - 掌握多窗口、文件操作等高级功能
    - 能够设计完整的测试框架和报告系统 