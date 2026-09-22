# Swell Time Surf School

A small, dependency-free web app for a fictional beach-front surf school. It is plain HTML, CSS and JavaScript, so there is nothing to install or build.

## What it does

- **Lessons & prices** – four lesson types rendered from a data list in `script.js`.
- **Meet the coaches** – instructor cards.
- **Today's conditions** – sample wave, wind, temperature and tide figures with a simple "is it good for beginners?" verdict.
- **What our surfers say** – three short static testimonials.
- **Book a lesson** – a form with validation and a live price total. Bookings are saved in the browser's `localStorage` and listed on the page, where they can be cancelled.
- **Live availability** – each lesson has a daily capacity. The form shows how many spots are left for the chosen lesson and date, and refuses a booking that would overfill it. Cancelling a booking frees its spots again.

## Running it

Open `index.html` in any browser. That's it.

If you prefer a local server (useful for testing on a phone on the same Wi-Fi):

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Files

| File         | Purpose                                                   |
| ------------ | --------------------------------------------------------- |
| `index.html` | Page structure and the empty containers that JS fills in. |
| `style.css`  | All styling, including responsive rules for phones.       |
| `script.js`  | Data, rendering, form validation and booking storage.     |

## Things a real school would add next

- Fetch live conditions from a surf or tide API instead of sample data.
- Send bookings to a backend and take payment.
- Share availability between customers via a backend. Right now it only counts bookings made in this browser.
