"""
Dicoding Coding Camp Scraper Service
Adapted from diCodex/main.py to work with Docker Selenium container
"""
import html
import json
import os
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any

from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.support.ui import WebDriverWait
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
CODINGCAMP_URL = os.getenv("CODINGCAMP_URL", "https://codingcamp.dicoding.com")
SELENIUM_URL = os.getenv("SELENIUM_URL", "http://selenium:4444")
OUTPUT_DIR = Path("/app/output")
MAX_PAGINATION_STEPS = 300
INTERACTION_TIMEOUT_SECONDS = 20

# Credentials
EMAIL = os.getenv("DICODING_EMAIL", "")
PASSWORD = os.getenv("DICODING_PASSWORD", "")


class ScraperService:
    """Service for scraping Dicoding Coding Camp data"""
    
    def __init__(self):
        self._is_running = False
        self._last_run: Optional[str] = None
        self._last_error: Optional[str] = None
        self._last_result: Optional[Dict[str, Any]] = None
    
    def is_running(self) -> bool:
        """Check if scraper is currently running"""
        return self._is_running
    
    def get_status(self) -> Dict[str, Any]:
        """Get current scraper status"""
        return {
            "running": self._is_running,
            "last_run": self._last_run,
            "last_error": self._last_error,
            "last_result": self._last_result
        }
    
    def run_scraper(self) -> Dict[str, Any]:
        """Run the scraping process"""
        self._is_running = True
        self._last_error = None
        
        try:
            driver = self._build_driver()
            wait = WebDriverWait(driver, 30)
            
            try:
                # Navigate and login
                driver.get(CODINGCAMP_URL)
                self._wait_for_page_ready(driver, wait)
                self._click_password_link(driver, wait)
                self._login_with_email_password(driver, wait)
                
                # Wait for redirect after login
                WebDriverWait(driver, 30).until(lambda d: "/login" not in d.current_url)
                self._wait_for_page_ready(driver, wait)
                
                # Expand all student data
                self._expand_all_student_data(driver)
                time.sleep(0.8)
                
                # Extract and save data
                payload = self._build_export_json(driver)
                
                # Save to file
                group_name = self._sanitize_filename_part(payload["mentor"].get("group", "unknown_group"))
                timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
                
                OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
                out_path = OUTPUT_DIR / f"{group_name}_{timestamp}.json"
                out_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
                
                self._last_result = {
                    "success": True,
                    "file": str(out_path.name),
                    "students": payload["metadata"]["student_total"]
                }
                
                return self._last_result
                
            finally:
                driver.quit()
                
        except Exception as e:
            self._last_error = str(e)
            self._last_result = {
                "success": False,
                "error": str(e)
            }
            raise
        finally:
            self._is_running = False
            self._last_run = datetime.now(timezone.utc).isoformat()
    
    def _build_driver(self) -> webdriver.Remote:
        """Build Selenium Remote WebDriver for Docker container"""
        options = webdriver.ChromeOptions()
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        
        # Connect to Selenium standalone container
        driver = webdriver.Remote(
            command_executor=SELENIUM_URL,
            options=options
        )
        
        return driver
    
    # Helper functions adapted from diCodex/main.py
    
    @staticmethod
    def _normalize_space(text: str) -> str:
        return re.sub(r"\s+", " ", (text or "")).strip()
    
    @staticmethod
    def _sanitize_filename_part(text: str) -> str:
        cleaned = re.sub(r"[^\w\-]+", "_", (text or "").strip(), flags=re.ASCII)
        cleaned = cleaned.strip("_")
        return cleaned or "unknown_group"
    
    @staticmethod
    def _one(pattern: str, text: str) -> str:
        match = re.search(pattern, text, flags=re.S)
        if not match:
            return ""
        return ScraperService._normalize_space(html.unescape(match.group(1)))
    
    @staticmethod
    def _many(pattern: str, text: str) -> list:
        rows = []
        for match in re.findall(pattern, text, flags=re.S):
            if isinstance(match, str):
                rows.append((ScraperService._normalize_space(html.unescape(match)),))
            else:
                rows.append(tuple(ScraperService._normalize_space(html.unescape(item)) for item in match))
        return rows
    
    @staticmethod
    def _student_blocks(page_html: str) -> list:
        marker = '<div class="container flex flex-col pb-8 border-b">'
        parts = page_html.split(marker)[1:]
        blocks = []
        for idx, part in enumerate(parts):
            if idx < len(parts) - 1:
                part = part.split(marker)[0]
            blocks.append(part)
        return blocks
    
    @staticmethod
    def _find_first_visible(driver, locators):
        for by, value in locators:
            for element in driver.find_elements(by, value):
                if element.is_displayed():
                    return element
        return None
    
    @staticmethod
    def _wait_for_page_ready(driver, wait):
        wait.until(lambda d: d.execute_script("return document.readyState") == "complete")
        wait.until(ec.presence_of_element_located((By.CSS_SELECTOR, "body")))
    
    @staticmethod
    def _click_element(driver, element):
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
        try:
            element.click()
        except Exception:
            driver.execute_script("arguments[0].click();", element)
    
    def _click_password_link(self, driver, wait):
        locators = [
            (By.LINK_TEXT, "your password"),
            (By.XPATH, "//a[normalize-space()='your password']"),
            (By.XPATH, "//a[contains(normalize-space(.), 'your password')]"),
        ]
        
        for locator in locators:
            try:
                element = wait.until(ec.element_to_be_clickable(locator))
                self._click_element(driver, element)
                return
            except TimeoutException:
                continue
        
        raise NoSuchElementException("Link 'your password' not found")
    
    def _login_with_email_password(self, driver, wait):
        wait.until(ec.visibility_of_element_located((By.CSS_SELECTOR, "input[type='password']")))
        
        if not EMAIL or not PASSWORD:
            raise ValueError("EMAIL/PASSWORD empty. Set DICODING_EMAIL and DICODING_PASSWORD environment variables.")
        
        email_input = self._find_first_visible(
            driver,
            [
                (By.CSS_SELECTOR, "input[type='email']"),
                (By.NAME, "email"),
                (By.ID, "email"),
            ],
        )
        password_input = self._find_first_visible(
            driver,
            [
                (By.CSS_SELECTOR, "input[type='password']"),
                (By.NAME, "password"),
                (By.ID, "password"),
            ],
        )
        submit_button = self._find_first_visible(
            driver,
            [
                (By.CSS_SELECTOR, "button[type='submit']"),
                (By.CSS_SELECTOR, "input[type='submit']"),
                (
                    By.XPATH,
                    "//button[contains(., 'Sign in') or contains(., 'Login') or contains(., 'Masuk')]",
                ),
            ],
        )
        
        if not email_input or not password_input or not submit_button:
            raise NoSuchElementException("Login form components not found")
        
        email_input.clear()
        email_input.send_keys(EMAIL)
        password_input.clear()
        password_input.send_keys(PASSWORD)
        self._click_element(driver, submit_button)
    
    def _expand_all_student_data(self, driver):
        """Expand all student data sections"""
        text_normalizer = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        text_lower = "abcdefghijklmnopqrstuvwxyz"
        
        student_input_locators = [
            (
                By.XPATH,
                f"//input[contains(translate(@placeholder, '{text_normalizer}', '{text_lower}'), 'student') "
                f"and contains(translate(@placeholder, '{text_normalizer}', '{text_lower}'), 'id')]",
            ),
        ]
        select_all_locators = [
            (
                By.XPATH,
                f"//button[contains(translate(normalize-space(.), '{text_normalizer}', '{text_lower}'), 'select all')]",
            ),
        ]
        expand_all_locators = [
            (
                By.XPATH,
                f"//button[contains(translate(normalize-space(.), '{text_normalizer}', '{text_lower}'), 'expand all')]",
            ),
        ]
        
        self._click_from_locators(driver, student_input_locators, "Input student's name or ID")
        time.sleep(1)
        self._click_from_locators(driver, select_all_locators, "Select All")
        time.sleep(1)
        self._click_from_locators(driver, expand_all_locators, "Expand All")
        time.sleep(2)
    
    def _click_from_locators(self, driver, locators, action_label):
        deadline = time.time() + INTERACTION_TIMEOUT_SECONDS
        last_error = None
        
        while time.time() < deadline:
            for by, value in locators:
                element = self._find_first_visible(driver, [(by, value)])
                if not element:
                    continue
                try:
                    self._click_element(driver, element)
                    return
                except Exception as error:
                    last_error = error
            time.sleep(0.4)
        
        message = f"Failed to click '{action_label}'"
        if last_error:
            raise NoSuchElementException(f"{message}. Detail: {last_error}") from last_error
        raise NoSuchElementException(message)
    
    def _build_export_json(self, driver) -> dict:
        """Build the JSON export from scraped data"""
        mentor = self._extract_mentor_from_dom(driver)
        
        # Click show all buttons
        show_all_courses_clicked = self._click_all_buttons_by_keyword(driver, "show all courses")
        show_all_assignments_clicked = self._click_all_buttons_by_keyword(driver, "show all assignments")
        time.sleep(0.6)
        
        source = driver.page_source
        blocks = self._student_blocks(source)
        
        if not blocks:
            raise NoSuchElementException("No student blocks found")
        
        students = [self._parse_student(block) for block in blocks]
        
        # Extract additional data for each student
        for idx in range(len(students)):
            students[idx]["progress"]["daily_checkins"] = {
                "items": self._extract_daily_checkins_all_pages(driver, idx)
            }
            students[idx]["progress"]["point_histories"] = self._extract_point_histories_all_pages(driver, idx)
        
        return {
            "metadata": {
                "generated_at_utc": datetime.now(timezone.utc).isoformat(),
                "source_url": driver.current_url,
                "student_total": len(students),
                "show_all_courses_clicked": show_all_courses_clicked,
                "show_all_assignments_clicked": show_all_assignments_clicked,
            },
            "mentor": mentor,
            "students": students,
        }
    
    def _extract_mentor_from_dom(self, driver) -> dict:
        """Extract mentor information from DOM"""
        return driver.execute_script(
            r"""
            const text = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
            const nav = Array.from(document.querySelectorAll("a.nav-link"))
              .map((el) => text(el))
              .filter(Boolean);
            return {
              name: text(document.querySelector(".sidebar-menu .text-xl")),
              mentor_code: text(document.querySelector(".sidebar-menu .text-id.uppercase")),
              group: text(document.querySelector("li .font-normal.text-black.pt-1.pl-5")),
              nav_items: nav,
              support_email: (document.querySelector("a[href^='mailto:']")?.getAttribute("href") || "").replace("mailto:", "")
            };
            """
        )
    
    def _click_all_buttons_by_keyword(self, driver, keyword: str, max_clicks: int = 500) -> int:
        """Click all buttons containing a keyword"""
        keyword = keyword.lower()
        clicked = 0
        xpath = (
            "//button[contains("
            "translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "
            f"'{keyword}'"
            ")]"
        )
        while clicked < max_clicks:
            buttons = driver.find_elements(By.XPATH, xpath)
            target = None
            for button in buttons:
                if button.is_displayed():
                    target = button
                    break
            if not target:
                break
            self._click_element(driver, target)
            clicked += 1
            time.sleep(0.2)
        return clicked
    
    def _parse_student(self, block_html: str) -> dict:
        """Parse student data from HTML block"""
        # Simplified version - adapt full logic from diCodex if needed
        profile = {
            "name": self._one(r'<h3 class="text-3xl font-semibold">([^<]+)</h3>', block_html),
            "status_badge": self._one(r'<div class="inline-block text-xs font-medium[^>]*><p>([^<]+)</p></div>', block_html),
            "university": self._one(
                r'<p class="text-sm text-gray-700">University</p></div><p class="font-normal text-black pl-4">([^<]+)</p>',
                block_html,
            ),
        }
        
        # Extract courses
        course_section = self._one(
            r'(data-element="course-progress-title".*?</div></div></div></section>)',
            block_html,
        )
        courses = [
            {
                "course": course,
                "progress_percent": percent,
                "status": status,
            }
            for course, percent, status in self._many(
                r'data-course="([^"]+)".*?<span[^>]*class="mr-2">([^<]+)</span><span[^>]*data-element="item-status-label">([^<]+)</span>',
                course_section,
            )
        ]
        
        return {
            "profile": profile,
            "progress": {
                "course_progress": {
                    "items": courses,
                },
            },
        }
    
    def _extract_daily_checkins_all_pages(self, driver, student_index: int) -> list:
        """Extract daily check-ins with pagination"""
        # Simplified - implement full pagination logic if needed
        return []
    
    def _extract_point_histories_all_pages(self, driver, student_index: int) -> dict:
        """Extract point histories with pagination"""
        # Simplified - implement full pagination logic if needed
        return {
            "items": [],
            "total_point": "0"
        }
