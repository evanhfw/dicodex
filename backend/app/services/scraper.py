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
        self._scraper_email: Optional[str] = None
        self._scraper_password: Optional[str] = None
    
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
    
    def run_scraper(self, email: Optional[str] = None, password: Optional[str] = None) -> Dict[str, Any]:
        """
        Run the scraping process
        
        Args:
            email: Dicoding email (optional, falls back to env var)
            password: Dicoding password (optional, falls back to env var)
        """
        self._is_running = True
        self._last_error = None
        
        # Use provided credentials or fallback to env vars
        self._scraper_email = email or os.getenv("DICODING_EMAIL", "")
        self._scraper_password = password or os.getenv("DICODING_PASSWORD", "")
        
        if not self._scraper_email or not self._scraper_password:
            self._is_running = False
            raise ValueError("Email and password are required")
        
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
        
        if not self._scraper_email or not self._scraper_password:
            raise ValueError("EMAIL/PASSWORD empty. Credentials must be provided.")
        
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
        email_input.send_keys(self._scraper_email)
        password_input.clear()
        password_input.send_keys(self._scraper_password)
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
            (
                By.XPATH,
                f"//input[contains(translate(@aria-label, '{text_normalizer}', '{text_lower}'), 'student') "
                f"and contains(translate(@aria-label, '{text_normalizer}', '{text_lower}'), 'id')]",
            ),
            (
                By.XPATH,
                f"//div[contains(translate(normalize-space(.), '{text_normalizer}', '{text_lower}'), \"student's name or id\")]",
            ),
        ]
        select_all_locators = [
            (
                By.XPATH,
                f"//button[contains(translate(normalize-space(.), '{text_normalizer}', '{text_lower}'), 'select all')]",
            ),
            (
                By.XPATH,
                f"//label[contains(translate(normalize-space(.), '{text_normalizer}', '{text_lower}'), 'select all')]",
            ),
            (
                By.XPATH,
                f"//span[contains(translate(normalize-space(.), '{text_normalizer}', '{text_lower}'), 'select all')]",
            ),
        ]
        expand_all_locators = [
            (
                By.XPATH,
                f"//button[contains(translate(normalize-space(.), '{text_normalizer}', '{text_lower}'), 'expand all')]",
            ),
            (
                By.XPATH,
                f"//span[contains(translate(normalize-space(.), '{text_normalizer}', '{text_lower}'), 'expand all')]",
            ),
            (
                By.XPATH,
                f"//*[@role='button' and contains(translate(normalize-space(.), '{text_normalizer}', '{text_lower}'), 'expand all')]",
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
        profile = {
            "name": self._one(r'<h3 class="text-3xl font-semibold">([^<]+)</h3>', block_html),
            "profile_link": self._one(r'<h1><a href="([^"]+)"', block_html),
            "photo_url": self._one(r'<img alt="[^"]+" src="([^"]+firebasestorage[^"]+)"', block_html),
            "status_badge": self._one(r'<div class="inline-block text-xs font-medium[^>]*><p>([^<]+)</p></div>', block_html),
            "university": self._one(
                r'<p class="text-sm text-gray-700">University</p></div><p class="font-normal text-black pl-4">([^<]+)</p>',
                block_html,
            ),
            "major": self._one(
                r'<p class="text-sm text-gray-700">Major</p></div><p class="font-normal text-black pl-4">([^<]+)</p>',
                block_html,
            ),
            "facilitator": self._one(
                r'<p class="text-sm text-gray-700">Facilitator</p></div><p class="font-normal text-black pl-4 break-words">([^<]+)</p>',
                block_html,
            ),
            "lecturer": self._one(
                r'<p class="text-sm text-gray-700">Lecturer</p></div><p class="font-normal text-black pl-4(?: break-words)?">([^<]+)</p>',
                block_html,
            ),
        }

        # Extract attendances
        attendance_section = self._one(r'<section class="attendances w-full">(.*?)</section>', block_html)
        attendances = [
            {"event": event, "status": status}
            for event, status in self._many(
                r'data-event-name="([^"]+)".*?data-element="item-status-label">([^<]+)<',
                attendance_section,
            )
        ]
        attendance_last_updated = self._one(
            r'data-element="attendance-last-update">Last updated: ([^<]+)<',
            attendance_section,
        )

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
        course_last_updated = self._one(
            r'data-element="course-progress-last-update">Last updated: ([^<]+)<',
            course_section,
        )

        # Extract assignments
        assignment_section = self._one(r'<section class="assignments w-full">(.*?)</section>', block_html)
        assignments = [
            {"assignment": name, "status": status}
            for name, status in self._many(
                r'data-assign-name="([^"]+)".*?data-element="item-status-label">([^<]+)<',
                assignment_section,
            )
        ]
        assignment_last_updated = self._one(
            r'data-element="assignment-last-update">Last updated: ([^<]+)<',
            assignment_section,
        )
        assignment_fallback = self._one(r'data-element="assignment-none">\s*([^<]+)\s*<', assignment_section)

        # Extract daily check-ins (initial parse, full pagination done later)
        daily_section = self._one(r'<section class="daily-checkins w-full">(.*?)</section>', block_html)
        daily_checkins = [
            {
                "mood": mood,
                "date": date,
                "reflection": reflection,
            }
            for mood, date, reflection in self._many(
                r'alt="([A-Za-z]+) mood".*?<p class="text-sm text-gray-500">([^<]+)</p>.*?<p class="text-sm text-gray-700">([^<]*)</p>',
                daily_section,
            )
        ]

        return {
            "profile": profile,
            "progress": {
                "attendances": {
                    "last_updated": attendance_last_updated,
                    "items": attendances,
                },
                "course_progress": {
                    "last_updated": course_last_updated,
                    "items": courses,
                },
                "assignments": {
                    "last_updated": assignment_last_updated,
                    "items": assignments,
                    "fallback_text_if_empty": assignment_fallback,
                },
                "daily_checkins": {
                    "items": daily_checkins,
                },
            },
        }
    
    def _extract_daily_checkins_all_pages(self, driver, student_index: int) -> list:
        """Extract daily check-ins with pagination"""
        items = []
        seen = set()
        stale_rounds = 0

        for _ in range(MAX_PAGINATION_STEPS):
            sections = driver.find_elements(By.CSS_SELECTOR, "section.daily-checkins")
            if student_index >= len(sections):
                break
            section = sections[student_index]

            entries = driver.execute_script(
                r"""
                const section = arguments[0];
                const text = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
                const cards = Array.from(section.querySelectorAll("div.border-b.p-6"));
                return cards.map((card) => {
                  const mood = text(card.querySelector("p.text-lg"));
                  const date = text(card.querySelector("p.text-sm.text-gray-500"));
                  const reflectionHeading = Array.from(card.querySelectorAll("p.text-md.font-semibold"))
                    .find((el) => /reflection/i.test(text(el)));
                  let reflection = "";
                  if (reflectionHeading) {
                    reflection = text(reflectionHeading.parentElement?.querySelector("p.text-sm.text-gray-700"));
                  }

                  const goalsHeading = Array.from(card.querySelectorAll("p.text-md.font-semibold"))
                    .find((el) => /goals/i.test(text(el)));
                  let goals = [];
                  if (goalsHeading) {
                    const goalsRoot = goalsHeading.parentElement;
                    const groups = Array.from(goalsRoot.querySelectorAll("div.mb-3, div.last\\:mb-0"));
                    if (groups.length === 0) {
                      const fallbackItems = Array.from(goalsRoot.querySelectorAll("li")).map((el) => text(el)).filter(Boolean);
                      if (fallbackItems.length > 0) {
                        goals.push({ title: "", items: fallbackItems });
                      }
                    } else {
                      goals = groups.map((group) => ({
                        title: text(group.querySelector("p.text-sm.font-semibold")),
                        items: Array.from(group.querySelectorAll("li")).map((el) => text(el)).filter(Boolean),
                      }));
                    }
                  }

                  return { mood, date, reflection, goals };
                });
                """,
                section,
            )

            before = len(seen)
            for entry in entries:
                key = json.dumps(
                    {
                        "mood": self._normalize_space(entry.get("mood", "")),
                        "date": self._normalize_space(entry.get("date", "")),
                        "reflection": self._normalize_space(entry.get("reflection", "")),
                        "goals": entry.get("goals", []),
                    },
                    ensure_ascii=False,
                    sort_keys=True,
                )
                if key in seen:
                    continue
                seen.add(key)
                items.append(json.loads(key))

            if len(seen) == before:
                stale_rounds += 1
            else:
                stale_rounds = 0

            next_buttons = section.find_elements(
                By.XPATH,
                ".//button[normalize-space()='Next' or .//span[normalize-space()='Next']]",
            )
            if not next_buttons:
                break
            next_button = next_buttons[0]
            disabled = next_button.get_attribute("disabled") is not None or (not next_button.is_enabled())
            if disabled or stale_rounds >= 2:
                break

            self._click_element(driver, next_button)
            time.sleep(0.35)

        return items
    
    def _extract_point_histories_all_pages(self, driver, student_index: int) -> dict:
        """Extract point histories with pagination"""
        last_updated = ""
        total_point = ""
        items = []
        seen = set()
        none_text = ""
        stale_rounds = 0

        for _ in range(MAX_PAGINATION_STEPS):
            sections = driver.find_elements(By.CSS_SELECTOR, "section.point-histories")
            if student_index >= len(sections):
                break
            section = sections[student_index]

            payload = driver.execute_script(
                r"""
                const section = arguments[0];
                const text = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();

                const lastUpdatedRaw = text(section.querySelector("[data-element='point-histories-last-update']"));
                const totalBlock = Array.from(section.querySelectorAll("div.flex.justify-between.items-center.border-b.p-6"))
                  .find((el) => /total point/i.test(text(el)));
                const totalPoint = totalBlock ? text(totalBlock.querySelector("p.text-lg, p.text-xl")) : "";
                const noneText = text(section.querySelector("[data-element='point-histories-none']"));

                const rows = Array.from(section.querySelectorAll("div.space-y-0 > div"))
                  .map((row) => {
                    const values = Array.from(row.querySelectorAll("p,span")).map((el) => text(el)).filter(Boolean);
                    const rawText = text(row);
                    return { values, raw_text: rawText };
                  })
                  .filter((row) => row.raw_text && !/you have no point histories data/i.test(row.raw_text));

                return {
                  last_updated: lastUpdatedRaw.replace(/^Last updated:\s*/i, ""),
                  total_point: totalPoint,
                  none_text: noneText,
                  rows
                };
                """,
                section,
            )

            last_updated = self._normalize_space(payload.get("last_updated", "") or last_updated)
            total_point = self._normalize_space(payload.get("total_point", "") or total_point)
            none_text = self._normalize_space(payload.get("none_text", "") or none_text)

            before = len(seen)
            for row in payload.get("rows", []):
                key = json.dumps(
                    {
                        "raw_text": self._normalize_space(row.get("raw_text", "")),
                        "values": [self._normalize_space(v) for v in row.get("values", [])],
                    },
                    ensure_ascii=False,
                    sort_keys=True,
                )
                if key in seen:
                    continue
                seen.add(key)
                items.append(json.loads(key))

            if len(seen) == before:
                stale_rounds += 1
            else:
                stale_rounds = 0

            next_buttons = section.find_elements(
                By.XPATH,
                ".//button[normalize-space()='Next' or .//span[normalize-space()='Next']]",
            )
            if not next_buttons:
                break
            next_button = next_buttons[0]
            disabled = next_button.get_attribute("disabled") is not None or (not next_button.is_enabled())
            if disabled or stale_rounds >= 2:
                break

            self._click_element(driver, next_button)
            time.sleep(0.35)

        return {
            "last_updated": last_updated,
            "total_point": total_point,
            "items": items,
            "fallback_text_if_empty": none_text,
        }
