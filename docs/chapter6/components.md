# logging模块四大组件

> 本节详细介绍Python logging模块的四个核心组件：Logger、Handler、Formatter和Filter，以及它们之间的协作关系。

## 四大组件概览

Python的logging模块基于四个核心组件构建，它们协同工作提供完整的日志功能：

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Logger    │ ── │   Handler   │ ── │  Formatter  │    │   Filter    │
│   记录器     │    │   处理器     │    │   格式器     │    │   过滤器     │
│(决定记录什么) │    │(决定输出哪里) │    │(决定输出格式) │    │(决定过滤条件) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## 1. Logger（记录器）

### 作用与功能
- **接口提供**：为应用程序代码提供直接使用的日志接口
- **级别控制**：决定哪些级别的日志记录会被处理
- **层次管理**：支持层次结构和继承关系
- **Handler管理**：管理多个处理器，决定日志的输出目标

### 基本使用
```python
import logging

# 创建记录器
logger = logging.getLogger('test_automation')
logger.setLevel(logging.DEBUG)

# 使用记录器记录不同级别的日志
logger.debug("这是调试信息")
logger.info("这是普通信息")
logger.warning("这是警告信息")
logger.error("这是错误信息")
logger.critical("这是严重错误信息")
```

### 层次结构
```python
# 创建父记录器
parent_logger = logging.getLogger('automation')
parent_logger.setLevel(logging.INFO)

# 创建子记录器（自动继承父记录器配置）
child_logger = logging.getLogger('automation.selenium')
grandchild_logger = logging.getLogger('automation.selenium.webdriver')

# 层次关系：automation ← automation.selenium ← automation.selenium.webdriver
```

### 记录器配置
```python
class LoggerManager:
    """日志记录器管理类"""
    
    @staticmethod
    def get_logger(name, level=logging.INFO):
        """获取配置好的记录器"""
        logger = logging.getLogger(name)
        logger.setLevel(level)
        
        # 避免重复添加处理器
        if not logger.handlers:
            # 这里会在后续添加处理器
            pass
            
        return logger
    
    @staticmethod
    def get_test_logger(test_name):
        """获取测试专用记录器"""
        return LoggerManager.get_logger(f'test.{test_name}', logging.DEBUG)

# 使用示例
login_logger = LoggerManager.get_test_logger('login')
search_logger = LoggerManager.get_test_logger('search')
```

## 2. Handler（处理器）

### 作用与功能
- **输出控制**：决定日志记录的输出位置（控制台、文件、网络等）
- **级别过滤**：每个处理器可以设置自己的日志级别
- **格式应用**：应用格式器来格式化日志消息
- **多目标支持**：同一个记录器可以关联多个处理器

### 常用处理器类型

#### StreamHandler - 控制台输出
```python
import logging
import sys

# 创建控制台处理器
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)

# 也可以输出到标准错误流
error_handler = logging.StreamHandler(sys.stderr)
error_handler.setLevel(logging.ERROR)

# 应用到记录器
logger = logging.getLogger('test')
logger.addHandler(console_handler)
logger.addHandler(error_handler)
```

#### FileHandler - 文件输出
```python
import logging

# 创建文件处理器
file_handler = logging.FileHandler('test.log', encoding='utf-8')
file_handler.setLevel(logging.DEBUG)

# 追加模式文件处理器
append_handler = logging.FileHandler('test.log', mode='a', encoding='utf-8')

# 应用到记录器
logger = logging.getLogger('test')
logger.addHandler(file_handler)
```

#### RotatingFileHandler - 文件大小轮转
```python
import logging
from logging.handlers import RotatingFileHandler

# 创建轮转文件处理器
rotating_handler = RotatingFileHandler(
    'test.log',                # 文件名
    maxBytes=1024*1024*5,      # 最大5MB
    backupCount=3,             # 保留3个备份文件
    encoding='utf-8'
)
rotating_handler.setLevel(logging.DEBUG)

logger = logging.getLogger('test')
logger.addHandler(rotating_handler)

# 文件轮转结果：test.log, test.log.1, test.log.2, test.log.3
```

#### TimedRotatingFileHandler - 时间轮转
```python
import logging
from logging.handlers import TimedRotatingFileHandler

# 创建按时间轮转的文件处理器
timed_handler = TimedRotatingFileHandler(
    'test.log',
    when='D',           # 按天轮转 (H=小时, D=天, W=周, M=月)
    interval=1,         # 每1天
    backupCount=7,      # 保留7天的日志
    encoding='utf-8'
)
timed_handler.setLevel(logging.DEBUG)

logger = logging.getLogger('test')
logger.addHandler(timed_handler)
```

### 多处理器配置
```python
import logging
from logging.handlers import RotatingFileHandler

def setup_multi_handler_logger():
    """配置多处理器日志系统"""
    logger = logging.getLogger('automation')
    logger.setLevel(logging.DEBUG)
    
    # 清除现有处理器
    logger.handlers.clear()
    
    # 控制台处理器 - 只显示INFO及以上
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    # 详细日志文件处理器 - 记录所有级别
    debug_file_handler = RotatingFileHandler(
        'debug.log',
        maxBytes=1024*1024*10,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    debug_file_handler.setLevel(logging.DEBUG)
    
    # 错误日志文件处理器 - 只记录错误
    error_file_handler = RotatingFileHandler(
        'error.log',
        maxBytes=1024*1024*5,   # 5MB
        backupCount=3,
        encoding='utf-8'
    )
    error_file_handler.setLevel(logging.ERROR)
    
    # 添加所有处理器
    logger.addHandler(console_handler)
    logger.addHandler(debug_file_handler)
    logger.addHandler(error_file_handler)
    
    return logger

# 使用示例
logger = setup_multi_handler_logger()
logger.debug("这条消息只会写入debug.log")
logger.info("这条消息会显示在控制台和debug.log")
logger.error("这条消息会出现在所有三个地方")
```

## 3. Formatter（格式器）

### 作用与功能
- **格式定义**：决定日志记录的输出格式
- **信息提取**：从日志记录中提取所需信息
- **样式统一**：确保日志输出的一致性
- **可读性提升**：使日志更易于阅读和分析

### 格式化字符串

#### 常用格式化字段
```python
# 常用的日志格式化字段
format_fields = {
    '%(asctime)s':     '时间戳',
    '%(name)s':        '记录器名称',
    '%(levelname)s':   '日志级别名称',
    '%(levelno)s':     '日志级别数值',
    '%(filename)s':    '文件名',
    '%(lineno)d':      '行号',
    '%(funcName)s':    '函数名',
    '%(module)s':      '模块名',
    '%(message)s':     '日志消息',
    '%(pathname)s':    '完整路径名',
    '%(process)d':     '进程ID',
    '%(thread)d':      '线程ID',
    '%(threadName)s':  '线程名称'
}
```

#### 基础格式器
```python
import logging

# 简单格式
simple_formatter = logging.Formatter('%(levelname)s - %(message)s')

# 标准格式
standard_formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# 详细格式
detailed_formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(funcName)s() - %(message)s'
)

# 自定义时间格式
custom_time_formatter = logging.Formatter(
    '%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
```

### 自定义格式器
```python
import logging
from datetime import datetime

class CustomFormatter(logging.Formatter):
    """自定义格式器"""
    
    def __init__(self):
        super().__init__()
        
        # 定义不同级别的颜色（ANSI颜色代码）
        self.COLORS = {
            'DEBUG': '\033[36m',    # 青色
            'INFO': '\033[32m',     # 绿色
            'WARNING': '\033[33m',  # 黄色
            'ERROR': '\033[31m',    # 红色
            'CRITICAL': '\033[35m', # 紫色
        }
        self.RESET = '\033[0m'      # 重置颜色
        
        # 不同级别的格式
        self.FORMATS = {
            logging.DEBUG: f"{self.COLORS['DEBUG']}[DEBUG] %(asctime)s - %(filename)s:%(lineno)d - %(message)s{self.RESET}",
            logging.INFO: f"{self.COLORS['INFO']}[INFO] %(asctime)s - %(message)s{self.RESET}",
            logging.WARNING: f"{self.COLORS['WARNING']}[WARNING] %(asctime)s - %(filename)s:%(lineno)d - %(message)s{self.RESET}",
            logging.ERROR: f"{self.COLORS['ERROR']}[ERROR] %(asctime)s - %(filename)s:%(lineno)d - %(message)s{self.RESET}",
            logging.CRITICAL: f"{self.COLORS['CRITICAL']}[CRITICAL] %(asctime)s - %(filename)s:%(lineno)d - %(message)s{self.RESET}",
        }
    
    def format(self, record):
        """格式化日志记录"""
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt, datefmt='%H:%M:%S')
        return formatter.format(record)

# 使用自定义格式器
logger = logging.getLogger('test')
handler = logging.StreamHandler()
handler.setFormatter(CustomFormatter())
logger.addHandler(handler)
logger.setLevel(logging.DEBUG)

# 测试不同级别的日志输出
logger.debug("这是调试信息")
logger.info("这是普通信息")
logger.warning("这是警告信息")
logger.error("这是错误信息")
```

### 测试专用格式器
```python
class TestFormatter(logging.Formatter):
    """测试专用格式器"""
    
    def __init__(self):
        super().__init__()
        
    def format(self, record):
        """为测试日志添加特殊标记"""
        
        # 添加测试用例标识
        if hasattr(record, 'test_case'):
            test_case = record.test_case
        else:
            test_case = "Unknown"
        
        # 添加步骤编号
        if hasattr(record, 'step_no'):
            step_no = f"Step {record.step_no}"
        else:
            step_no = ""
        
        # 格式化时间
        formatted_time = datetime.now().strftime('%H:%M:%S.%f')[:-3]
        
        # 构建格式化消息
        formatted_msg = f"[{formatted_time}] [{record.levelname}] [{test_case}] {step_no} - {record.getMessage()}"
        
        return formatted_msg

# 使用测试格式器
class TestLogger:
    def __init__(self, test_case_name):
        self.logger = logging.getLogger(f'test.{test_case_name}')
        self.test_case_name = test_case_name
        self.step_counter = 0
        
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            handler.setFormatter(TestFormatter())
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.DEBUG)
    
    def step(self, message, level=logging.INFO):
        """记录测试步骤"""
        self.step_counter += 1
        
        # 创建带额外信息的日志记录
        record = self.logger.makeRecord(
            self.logger.name, level, __file__, 0, message, (), None
        )
        record.test_case = self.test_case_name
        record.step_no = self.step_counter
        
        self.logger.handle(record)

# 使用示例
test_logger = TestLogger("login_test")
test_logger.step("打开登录页面")
test_logger.step("输入用户名")
test_logger.step("输入密码")
test_logger.step("点击登录按钮")
```

## 4. Filter（过滤器）

### 作用与功能
- **精细控制**：提供比日志级别更精细的控制机制
- **条件过滤**：基于复杂条件过滤日志记录
- **信息保护**：过滤敏感信息
- **模块控制**：控制特定模块的日志输出

### 基础过滤器
```python
import logging

class LevelRangeFilter(logging.Filter):
    """级别范围过滤器"""
    
    def __init__(self, min_level, max_level):
        super().__init__()
        self.min_level = min_level
        self.max_level = max_level
    
    def filter(self, record):
        """只允许指定级别范围内的日志通过"""
        return self.min_level <= record.levelno <= self.max_level

# 使用级别范围过滤器
logger = logging.getLogger('test')
handler = logging.StreamHandler()

# 只记录INFO到WARNING级别的日志
range_filter = LevelRangeFilter(logging.INFO, logging.WARNING)
handler.addFilter(range_filter)

logger.addHandler(handler)
logger.setLevel(logging.DEBUG)

# 测试过滤效果
logger.debug("不会显示")      # 级别太低
logger.info("会显示")        # 在范围内
logger.warning("会显示")     # 在范围内
logger.error("不会显示")     # 级别太高
```

### 模块过滤器
```python
class ModuleFilter(logging.Filter):
    """模块过滤器"""
    
    def __init__(self, allowed_modules):
        super().__init__()
        self.allowed_modules = allowed_modules
    
    def filter(self, record):
        """只允许指定模块的日志通过"""
        return any(record.name.startswith(module) for module in self.allowed_modules)

# 使用模块过滤器
module_filter = ModuleFilter(['test.login', 'test.search'])
handler = logging.StreamHandler()
handler.addFilter(module_filter)

# 只有来自test.login和test.search模块的日志会被输出
login_logger = logging.getLogger('test.login')
search_logger = logging.getLogger('test.search')
payment_logger = logging.getLogger('test.payment')

login_logger.addHandler(handler)
search_logger.addHandler(handler)
payment_logger.addHandler(handler)

login_logger.info("登录日志会显示")
search_logger.info("搜索日志会显示")
payment_logger.info("支付日志不会显示")  # 被过滤掉
```

### 敏感信息过滤器
```python
import re

class SensitiveDataFilter(logging.Filter):
    """敏感数据过滤器"""
    
    def __init__(self):
        super().__init__()
        # 定义敏感信息的正则表达式
        self.patterns = [
            (re.compile(r'password["\']?\s*[:=]\s*["\']?([^"\s,}]+)', re.IGNORECASE), 'password=***'),
            (re.compile(r'token["\']?\s*[:=]\s*["\']?([^"\s,}]+)', re.IGNORECASE), 'token=***'),
            (re.compile(r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b'), '****-****-****-****'),  # 信用卡号
            (re.compile(r'\b\d{11}\b'), '***********'),  # 手机号
        ]
    
    def filter(self, record):
        """过滤敏感信息"""
        if hasattr(record, 'msg'):
            message = str(record.msg)
            for pattern, replacement in self.patterns:
                message = pattern.sub(replacement, message)
            record.msg = message
        return True

# 使用敏感信息过滤器
logger = logging.getLogger('security')
handler = logging.StreamHandler()
handler.addFilter(SensitiveDataFilter())
logger.addHandler(handler)
logger.setLevel(logging.DEBUG)

# 测试敏感信息过滤
logger.info("用户登录: username=admin, password=secret123")
logger.info("API调用: token=abc123def456")
logger.info("支付信息: card=1234 5678 9012 3456")
```

### 性能过滤器
```python
import time

class PerformanceFilter(logging.Filter):
    """性能监控过滤器"""
    
    def __init__(self, slow_threshold=1.0):
        super().__init__()
        self.slow_threshold = slow_threshold
        self.start_times = {}
    
    def filter(self, record):
        """标记慢操作"""
        message = record.getMessage()
        
        # 检测操作开始
        if message.startswith("开始"):
            operation_id = id(record)
            self.start_times[operation_id] = time.time()
        
        # 检测操作结束
        elif message.startswith("完成"):
            operation_id = id(record)
            if operation_id in self.start_times:
                duration = time.time() - self.start_times[operation_id]
                if duration > self.slow_threshold:
                    record.msg = f"[慢操作 {duration:.2f}s] {record.msg}"
                del self.start_times[operation_id]
        
        return True

# 使用性能过滤器
logger = logging.getLogger('performance')
handler = logging.StreamHandler()
handler.addFilter(PerformanceFilter(slow_threshold=0.5))
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# 模拟操作
logger.info("开始登录操作")
time.sleep(0.8)  # 模拟慢操作
logger.info("完成登录操作")
```

## 组件协作示例

### 完整的四组件配置
```python
import logging
from logging.handlers import RotatingFileHandler

def setup_complete_logging():
    """配置完整的四组件日志系统"""
    
    # 1. 创建Logger
    logger = logging.getLogger('automation')
    logger.setLevel(logging.DEBUG)
    logger.handlers.clear()
    
    # 2. 创建Handler
    console_handler = logging.StreamHandler()
    file_handler = RotatingFileHandler(
        'automation.log',
        maxBytes=1024*1024*5,
        backupCount=3,
        encoding='utf-8'
    )
    
    # 3. 创建Formatter
    console_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%H:%M:%S'
    )
    file_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
    )
    
    # 4. 创建Filter
    class TestCaseFilter(logging.Filter):
        def filter(self, record):
            return 'test_' in record.funcName if hasattr(record, 'funcName') else True
    
    test_filter = TestCaseFilter()
    
    # 组装配置
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(console_formatter)
    console_handler.addFilter(test_filter)
    
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(file_formatter)
    
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    
    return logger

# 使用完整配置
logger = setup_complete_logging()

def test_login():
    logger.debug("开始测试登录功能")
    logger.info("输入用户凭据")
    logger.warning("响应时间较长")
    logger.error("登录失败")
    logger.critical("系统异常")

test_login() 