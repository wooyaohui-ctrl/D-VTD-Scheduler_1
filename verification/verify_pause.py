from playwright.sync_api import sync_playwright

def verify_pause_functionality():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (assuming default port 3000)
        page.goto("http://localhost:3000")

        # Wait for calendar to load
        page.wait_for_selector('text=D-VTD Scheduler')

        # Click on Day 1 to open the modal
        # Note: Day 1 might be "1" inside a circle. Locator strategy needs care.
        # We can look for text "Start Cycle 1" which is on Day 1.
        page.locator('text=Start Cycle 1').click()

        # Wait for modal to appear
        page.wait_for_selector('text=Pause treatment starting today?')

        # Click "Pause treatment starting today?"
        page.click('text=Pause treatment starting today?')

        # Select a resume date.
        # Since we are on today (or start date), let's pick 3 days later.
        # We need to find the input type="date"
        date_input = page.locator('input[type="date"]').nth(1) # The second date input (first is in header)

        # Set date to a few days ahead.
        # Assuming current date is today, let's just pick a static future date if possible,
        # but the input has a min attribute.
        # Let's get the min attribute value and add 3 days.
        min_date = date_input.get_attribute("min")
        # Just use value assignment for simplicity if we can't easily calc date in python without imports
        # Actually I can import datetime.

        import datetime
        min_date_obj = datetime.datetime.strptime(min_date, "%Y-%m-%d")
        resume_date = min_date_obj + datetime.timedelta(days=3)
        resume_date_str = resume_date.strftime("%Y-%m-%d")

        date_input.fill(resume_date_str)

        # Click Confirm Pause
        page.click('text=Confirm Pause')

        # Wait for modal to close (or check if day is paused)
        # The modal closes on confirm.
        # Now check if Day 1 (and 2, 3) shows "Paused".

        # We expect Day 1 to be Paused.
        # The grid item for Day 1 should have text "Paused".
        # We can take a screenshot of the calendar.

        page.wait_for_timeout(500) # Wait for animation/render

        page.screenshot(path="verification/paused_calendar.png")
        print("Screenshot saved to verification/paused_calendar.png")

        browser.close()

if __name__ == "__main__":
    verify_pause_functionality()
