# 环境搭建

> 本节介绍Selenium WebDriver的环境搭建步骤和配置方法。

## 环境准备步骤

1. 安装Python
     ```bash
     # 下载并安装Python（建议3.8+版本）
     # 安装时务必勾选"Add Python to PATH"
     python --version  # 验证安装
     ```
2. 安装Selenium库
     ```bash
     # 使用pip安装Selenium
     pip install selenium
 
     # 验证安装
     python -c "import selenium; print(selenium.__version__)"
     ```
3. 下载浏览器驱动
     - **Chrome浏览器**：下载 [ChromeDriver](https://chromedriver.chromium.org/)
     - **Firefox浏览器**：下载 [GeckoDriver](https://github.com/mozilla/geckodriver/releases)  
     - **Edge浏览器**：下载 [EdgeDriver](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/)
4. 配置驱动路径
     ```python
     # 方法1：将驱动放在Python Scripts目录
     # 方法2：添加到系统PATH环境变量
     # 方法3：代码中指定路径
     from selenium import webdriver
     
     driver = webdriver.Chrome("/path/to/chromedriver")
     ```
5. 自动管理驱动（推荐）
     ```bash
     # 安装webdriver-manager
     pip install webdriver-manager
     ```

     ```python
     from selenium import webdriver
     from webdriver_manager.chrome import ChromeDriverManager
     
     # 自动下载和管理ChromeDriver
     driver = webdriver.Chrome(ChromeDriverManager().install())
     ``` 