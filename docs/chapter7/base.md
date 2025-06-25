# 编程题实战技能训练

> **期末考试实战重点**：掌握页面截图、异常处理、浏览器导航与状态验证等核心技能，这些是编程题的必备技术点。

## 实战技能点概览

### 考试必备技能清单
1. **页面截图技术**：失败时自动保存错误截图
2. **异常处理机制**：完善的try-catch异常捕获
3. **浏览器导航验证**：前进、后退、刷新功能测试
4. **页面状态验证**：URL变化、标题验证、元素状态检查
5. **等待机制应用**：显式等待确保操作稳定性
6. **日志记录集成**：完整的操作日志和错误追踪

## 技能1：页面截图与异常处理

### 截图技术核心实现
```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import logging
import time
from datetime import datetime
import os

class ScreenshotHandler:
    """页面截图处理器 - 考试重点技能"""
    
    def __init__(self, driver, screenshot_dir="screenshots"):
        self.driver = driver
        self.screenshot_dir = screenshot_dir
        self._ensure_screenshot_directory()
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def _ensure_screenshot_directory(self):
        """确保截图目录存在"""
        if not os.path.exists(self.screenshot_dir):
            os.makedirs(self.screenshot_dir)
    
    def save_screenshot(self, scenario_name, include_timestamp=True):
        """保存页面截图 - 基础技能"""
        try:
            if include_timestamp:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{scenario_name}_{timestamp}.png"
            else:
                filename = f"{scenario_name}.png"
            
            filepath = os.path.join(self.screenshot_dir, filename)
            success = self.driver.save_screenshot(filepath)
            
            if success:
                self.logger.info(f"截图保存成功：{filepath}")
                return filepath
            else:
                self.logger.error("截图保存失败")
                return None
                
        except Exception as e:
            self.logger.error(f"截图保存异常：{e}")
            return None
    
    def save_element_screenshot(self, element, scenario_name):
        """保存元素截图 - 高级技能"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"element_{scenario_name}_{timestamp}.png"
            filepath = os.path.join(self.screenshot_dir, filename)
            
            success = element.screenshot(filepath)
            if success:
                self.logger.info(f"元素截图保存成功：{filepath}")
                return filepath
            else:
                self.logger.error("元素截图保存失败")
                return None
                
        except Exception as e:
            self.logger.error(f"元素截图保存异常：{e}")
            return None
```

### 综合异常处理框架
```python
from selenium.common.exceptions import (
    TimeoutException, NoSuchElementException, 
    WebDriverException, ElementNotInteractableException
)

class RobustTestFramework:
    """健壮的测试框架 - 完善的异常处理"""
    
    def __init__(self, base_url, timeout=10):
        self.base_url = base_url
        self.timeout = timeout
        self.driver = None
        self.wait = None
        self.screenshot_handler = None
        self._setup_logging()
        self._init_driver()
    
    def _setup_logging(self):
        """配置日志系统"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def _init_driver(self):
        """初始化WebDriver"""
        try:
            self.driver = webdriver.Chrome()
            self.wait = WebDriverWait(self.driver, self.timeout)
            self.screenshot_handler = ScreenshotHandler(self.driver)
            self.logger.info("WebDriver初始化成功")
        except Exception as e:
            self.logger.critical(f"WebDriver初始化失败：{e}")
            raise
    
    def safe_navigate(self, url):
        """安全导航 - 带异常处理"""
        try:
            self.logger.info(f"导航到：{url}")
            self.driver.get(url)
            
            # 验证页面加载
            self.wait.until(lambda driver: driver.execute_script("return document.readyState") == "complete")
            self.logger.info("页面加载完成")
            
        except TimeoutException:
            self.logger.error("页面加载超时")
            self.screenshot_handler.save_screenshot("navigation_timeout")
            raise
        except WebDriverException as e:
            self.logger.error(f"WebDriver异常：{e}")
            self.screenshot_handler.save_screenshot("webdriver_error")
            raise
    
    def safe_find_element(self, locator, description=""):
        """安全查找元素 - 带异常处理"""
        try:
            self.logger.debug(f"查找元素：{description}")
            element = self.wait.until(EC.presence_of_element_located(locator))
            self.logger.debug("元素查找成功")
            return element
            
        except TimeoutException:
            self.logger.error(f"元素查找超时：{description}")
            self.screenshot_handler.save_screenshot(f"element_not_found_{description}")
            raise
        except NoSuchElementException:
            self.logger.error(f"元素不存在：{description}")
            self.screenshot_handler.save_screenshot(f"element_missing_{description}")
            raise
    
    def safe_click(self, locator, description=""):
        """安全点击 - 带异常处理"""
        try:
            element = self.safe_find_element(locator, description)
            self.wait.until(EC.element_to_be_clickable(locator))
            element.click()
            self.logger.info(f"点击成功：{description}")
            
        except ElementNotInteractableException:
            self.logger.error(f"元素不可点击：{description}")
            self.screenshot_handler.save_screenshot(f"click_failed_{description}")
            raise
        except Exception as e:
            self.logger.error(f"点击操作异常：{e}")
            self.screenshot_handler.save_screenshot(f"click_error_{description}")
            raise
```

## 技能2：浏览器导航与状态验证

### 浏览器导航功能测试
```python
class BrowserNavigationTester:
    """浏览器导航功能测试器 - 考试核心技能"""
    
    def __init__(self, driver):
        self.driver = driver
        self.logger = logging.getLogger(self.__class__.__name__)
        self.screenshot_handler = ScreenshotHandler(driver)
    
    def test_navigation_functions(self, urls):
        """测试浏览器导航功能"""
        self.logger.info("开始测试浏览器导航功能")
        
        try:
            # 1. 导航到第一个页面
            self.driver.get(urls[0])
            self.logger.info(f"导航到页面1：{urls[0]}")
            self.verify_current_url(urls[0])
            
            # 2. 导航到第二个页面
            self.driver.get(urls[1])
            self.logger.info(f"导航到页面2：{urls[1]}")
            self.verify_current_url(urls[1])
            
            # 3. 测试后退功能
            self.driver.back()
            self.logger.info("执行后退操作")
            time.sleep(1)
            self.verify_current_url(urls[0])
            self.screenshot_handler.save_screenshot("after_back")
            
            # 4. 测试前进功能
            self.driver.forward()
            self.logger.info("执行前进操作")
            time.sleep(1)
            self.verify_current_url(urls[1])
            self.screenshot_handler.save_screenshot("after_forward")
            
            # 5. 测试刷新功能
            self.driver.refresh()
            self.logger.info("执行刷新操作")
            time.sleep(1)
            self.verify_current_url(urls[1])
            self.screenshot_handler.save_screenshot("after_refresh")
            
            self.logger.info("浏览器导航功能测试完成")
            return True
            
        except Exception as e:
            self.logger.error(f"导航功能测试失败：{e}")
            self.screenshot_handler.save_screenshot("navigation_test_error")
            return False
    
    def verify_current_url(self, expected_url):
        """验证当前URL"""
        current_url = self.driver.current_url
        if expected_url in current_url:
            self.logger.info(f"URL验证成功：{current_url}")
        else:
            self.logger.error(f"URL验证失败，期望：{expected_url}，实际：{current_url}")
            raise AssertionError(f"URL不匹配：期望包含{expected_url}，实际{current_url}")
    
    def verify_page_title(self, expected_title):
        """验证页面标题"""
        actual_title = self.driver.title
        if expected_title in actual_title:
            self.logger.info(f"标题验证成功：{actual_title}")
        else:
            self.logger.error(f"标题验证失败，期望：{expected_title}，实际：{actual_title}")
            raise AssertionError(f"标题不匹配：期望包含{expected_title}，实际{actual_title}")
```

### 页面状态验证器
```python
class PageStateValidator:
    """页面状态验证器 - 全面的状态检查"""
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def validate_page_loaded(self):
        """验证页面完全加载"""
        try:
            # 检查文档加载状态
            self.wait.until(lambda driver: driver.execute_script("return document.readyState") == "complete")
            
            # 检查jQuery加载状态（如果页面使用jQuery）
            try:
                self.wait.until(lambda driver: driver.execute_script("return jQuery.active == 0"))
            except:
                pass  # 页面可能不使用jQuery
            
            self.logger.info("页面加载状态验证通过")
            return True
            
        except TimeoutException:
            self.logger.error("页面加载状态验证超时")
            return False
    
    def validate_element_state(self, locator, expected_state):
        """验证元素状态"""
        try:
            element = self.driver.find_element(*locator)
            
            state_checks = {
                'visible': element.is_displayed(),
                'enabled': element.is_enabled(),
                'selected': element.is_selected()
            }
            
            if expected_state in state_checks and state_checks[expected_state]:
                self.logger.info(f"元素状态验证通过：{expected_state}")
                return True
            else:
                self.logger.error(f"元素状态验证失败：期望{expected_state}")
                return False
                
        except Exception as e:
            self.logger.error(f"元素状态验证异常：{e}")
            return False
    
    def validate_text_content(self, locator, expected_text):
        """验证文本内容"""
        try:
            element = self.wait.until(EC.presence_of_element_located(locator))
            actual_text = element.text
            
            if expected_text in actual_text:
                self.logger.info(f"文本内容验证通过：{actual_text}")
                return True
            else:
                self.logger.error(f"文本内容验证失败，期望：{expected_text}，实际：{actual_text}")
                return False
                
        except Exception as e:
            self.logger.error(f"文本内容验证异常：{e}")
            return False
```

## 技能3：综合实战案例

### 完整的测试场景实现
```python
class ComprehensiveTestSuite:
    """综合测试套件 - 整合所有技能"""
    
    def __init__(self, base_url):
        self.base_url = base_url
        self.framework = RobustTestFramework(base_url)
        self.navigator = BrowserNavigationTester(self.framework.driver)
        self.validator = PageStateValidator(self.framework.driver)
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def execute_comprehensive_test(self):
        """执行综合测试"""
        self.logger.info("开始执行综合测试套件")
        
        try:
            # 1. 页面导航测试
            self.framework.safe_navigate(self.base_url)
            self.validator.validate_page_loaded()
            
            # 2. 元素交互测试
            self.test_element_interactions()
            
            # 3. 导航功能测试
            test_urls = [self.base_url, f"{self.base_url}/about"]
            self.navigator.test_navigation_functions(test_urls)
            
            # 4. 状态验证测试
            self.test_state_validations()
            
            self.logger.info("综合测试套件执行成功")
            return True
            
        except Exception as e:
            self.logger.error(f"综合测试套件执行失败：{e}")
            self.framework.screenshot_handler.save_screenshot("comprehensive_test_error")
            return False
        
        finally:
            self.cleanup()
    
    def test_element_interactions(self):
        """测试元素交互"""
        # 查找并测试表单元素
        try:
            # 输入框测试
            input_locator = (By.ID, "test-input")
            input_element = self.framework.safe_find_element(input_locator, "测试输入框")
            input_element.send_keys("测试数据")
            
            # 按钮点击测试
            button_locator = (By.ID, "test-button")
            self.framework.safe_click(button_locator, "测试按钮")
            
            self.logger.info("元素交互测试完成")
            
        except Exception as e:
            self.logger.error(f"元素交互测试失败：{e}")
            raise
    
    def test_state_validations(self):
        """测试状态验证"""
        # URL状态验证
        self.navigator.verify_current_url(self.base_url)
        
        # 页面标题验证
        self.navigator.verify_page_title("测试页面")
        
        # 元素状态验证
        test_locator = (By.ID, "test-element")
        self.validator.validate_element_state(test_locator, "visible")
        
        self.logger.info("状态验证测试完成")
    
    def cleanup(self):
        """清理资源"""
        if self.framework.driver:
            self.framework.driver.quit()
            self.logger.info("浏览器已关闭")

# 使用示例
def main():
    """主测试函数"""
    test_suite = ComprehensiveTestSuite("https://example.com")
    success = test_suite.execute_comprehensive_test()
    print(f"测试结果：{'通过' if success else '失败'}")

if __name__ == "__main__":
    main()
```

## 技能4：考试题型解题模板

### 标准解题步骤
1. **初始化阶段**：设置WebDriver、等待对象、日志系统
2. **导航阶段**：安全导航到目标页面，验证页面加载
3. **操作阶段**：查找元素、执行交互、处理异常
4. **验证阶段**：检查操作结果、验证页面状态
5. **截图阶段**：保存关键步骤和错误截图
6. **清理阶段**：关闭浏览器、记录测试结果

### 通用代码模板
```python
# 考试必备模板
def test_template():
    driver = None
    try:
        # 1. 初始化
        driver = webdriver.Chrome()
        wait = WebDriverWait(driver, 10)
        screenshot_handler = ScreenshotHandler(driver)
        
        # 2. 导航
        driver.get("目标URL")
        wait.until(lambda d: d.execute_script("return document.readyState") == "complete")
        
        # 3. 操作
        element = wait.until(EC.presence_of_element_located((By.ID, "element-id")))
        element.send_keys("测试数据")
        
        # 4. 验证
        result = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "result")))
        assert "预期结果" in result.text
        
        # 5. 截图
        screenshot_handler.save_screenshot("test_success")
        
    except Exception as e:
        if driver:
            screenshot_handler.save_screenshot("test_error")
        raise
    finally:
        # 6. 清理
        if driver:
            driver.quit()
```

## 实战技能总结

### 考试关键点
1. **异常处理**：每个操作都要有try-catch包装
2. **等待机制**：使用显式等待确保操作稳定性  
3. **截图功能**：失败时自动保存错误截图
4. **日志记录**：详细记录操作过程和结果
5. **状态验证**：验证URL、标题、元素状态
6. **资源清理**：确保浏览器正确关闭

### 得分要点
- 代码结构清晰，注释完整
- 异常处理全面，错误信息详细
- 截图和日志功能完善
- 验证步骤充分，断言准确
- 资源管理规范，无内存泄漏