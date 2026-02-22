#!/usr/bin/env python3
"""
Generate synthetic transaction data for the categorization model.
Output CSV has: column 0 = description (text), column 1 = category.
Usage: python generate_synthetic_transactions.py [--rows 2000] [--out my_data.csv]
"""

import csv
import random
import argparse
from pathlib import Path

# Each category has multiple realistic descriptions (model learns from these words)
TEMPLATES = {
    "Food": [
        "Grocery shopping at Walmart", "Dinner at restaurant", "Coffee and lunch",
        "Pizza delivery", "Breakfast cafe", "Weekly groceries", "Lunch with colleagues",
        "Fast food meal", "Restaurant dinner", "Milk and bread", "Food delivery order",
        "Cafeteria lunch", "Takeout food", "Sandwich and coffee", "Brunch outing",
        "Street food", "Lunch break food", "Snacks and beverages", "Food truck",
        "Office cafeteria", "Dessert and coffee", "Food and drinks", "Hotel breakfast",
        "Meal prep ingredients", "Catering order", "Bulk groceries", "Organic food store",
        "Bakery and snacks", "Vegetables and fruits", "Supermarket groceries",
        "Kitchen supplies", "Coffee shop", "Grocery run", "Vending machine",
    ],
    "Rent": [
        "Monthly rent payment", "Landlord rent", "Apartment rent", "House rent",
        "Room rent", "Studio rent", "Rent deposit", "Monthly housing rent",
        "Tenant rent", "Rent for December", "Shared apartment rent", "Rent payment due",
        "First month rent", "Last month rent", "Rental agreement", "Lease payment",
        "Rent advance", "Rent reminder", "Rent auto debit", "Rent cheque",
        "Rent bank transfer", "Rent cash", "Rent online", "Rent payment", "Rent due",
        "Rent receipt", "Rent", "Lease renewal",
    ],
    "Utilities": [
        "Electricity bill payment", "Water bill", "Internet bill", "Gas utility bill",
        "Cable TV bill", "Heating bill", "Sewage bill", "Mobile recharge",
        "Maintenance fee utilities", "Council tax", "Property tax", "Drainage charge",
        "Standing charge utilities", "Green energy surcharge", "Renewable bill",
        "Dual tariff utilities", "Smart meter bill", "Prepaid electricity",
        "Winter heating", "Summer AC bill", "Quarterly utilities", "Meter reading bill",
        "Fixed charge utilities", "Dual fuel bill", "Estimated bill utilities",
        "Final bill utilities", "Utility payment", "Electric payment",
    ],
    "Transport": [
        "Uber to office", "Bus fare to city", "Gas station fuel", "Taxi ride",
        "Train ticket", "Metro card recharge", "Car parking fee", "Oil change and car service",
        "Bike rental", "Flight booking", "Subway fare", "Lyft ride", "Airport transfer",
        "Bicycle repair", "Public transport pass", "Petrol for car", "Boat ferry",
        "Scooter rental", "Intercity bus", "Cab to airport", "Highway toll",
        "Shuttle service", "Commute expense", "Bike share", "EV charging",
        "Park and ride", "Ola ride", "Car pool contribution", "Transit card",
        "Chauffeur service", "Parking permit", "Car share", "Transit fare",
        "Car insurance", "Bike purchase", "Parking lot", "Gas fill", "Cab fare",
        "Ride share", "Bus pass", "Fuel fill", "Rideshare to meeting",
    ],
    "Entertainment": [
        "Netflix subscription", "Spotify subscription", "Movie tickets", "Concert tickets",
        "Streaming subscription", "Video game purchase", "Theater show", "Museum entry",
        "Bowling night", "Theme park", "Karaoke night", "Comedy show", "Sports event ticket",
        "Festival ticket", "Gaming subscription", "Live music event", "Hobby class",
        "Zoo visit", "Escape room", "Arcade games", "Stand-up comedy", "Theater play",
        "Exhibition entry", "Amusement park", "Sports bar", "Concert", "Cinema movie",
        "Netflix and chill", "Concert venue", "Cinema snacks",
    ],
    "Health": [
        "Doctor visit and prescription", "Pharmacy medicine", "Gym membership",
        "Doctor consultation", "Hospital bill", "Dental checkup", "Vitamin supplements",
        "Physiotherapy", "Eye checkup", "Lab tests", "Medical insurance",
        "X-ray and scan", "Emergency room", "Health club", "Medical equipment",
        "Dental surgery", "Health screening", "Specialist doctor", "Blood test",
        "Pharmacy run", "Vaccination", "Mental health session", "Nutritionist",
        "Hospital visit", "Doctor", "Clinic visit", "Annual checkup", "Physician visit",
    ],
    "Shopping": [
        "Amazon purchase Shopping", "Electronics purchase", "Clothing store",
        "Furniture shopping", "Gift purchase", "Home decor", "Shoe store",
        "Department store", "Online shopping", "Black Friday sale", "Electronics sale",
        "Fashion outlet", "Baby products", "Grocery delivery", "Warehouse sale",
        "Outlet mall", "Flash sale purchase", "Brand outlet", "Clearance sale",
        "Thrift shop", "Mall shopping", "Retail therapy", "Discount store",
        "Gift shop", "Book store", "Shopping",
    ],
    "Education": [
        "Online course fee", "Books from bookstore", "University tuition",
        "Online certification", "Programming bootcamp", "Language course",
        "Textbook purchase", "Training program", "Certification exam", "MBA course fee",
        "Data science course", "Webinar registration", "Professional course",
        "Short course fee", "Skill upgrade course", "Executive education",
        "Online degree", "Workshop attendance", "Conference fee", "Seminar fee",
        "Bootcamp fee", "Diploma program", "Night class", "Evening course",
        "Course material", "Tuition fee", "School fee", "Workshop fee",
    ],
    "Salary": [
        "Salary credit", "Monthly salary", "Freelance payment received", "Bonus payment",
        "Part-time income", "Consulting fee", "Overtime pay", "Commission earned",
        "Dividend income", "Stocks dividend", "Refund received", "Gig economy pay",
        "Performance bonus", "Contract payment", "Royalty income", "Freelance project",
        "Tips received", "Incentive pay", "Advance payment", "Back pay",
        "Overtime salary", "Salary credit", "Paycheck", "Wage payment", "Income",
    ],
    "Others": [
        "Miscellaneous expense", "Cash withdrawal", "Bank fee", "Transfer to savings",
        "Charity donation", "Gift to family", "Uncategorized", "Other expense",
    ],
}


def generate_row(category: str, templates: list[str]) -> tuple[str, str]:
    """Pick a random description for the category, optionally add amount-like text."""
    desc = random.choice(templates)
    if random.random() < 0.2:  # sometimes add a number
        desc = f"{desc} {random.randint(5, 500)}"
    return (desc, category)


def main():
    ap = argparse.ArgumentParser(description="Generate synthetic transaction CSV for categorization model.")
    ap.add_argument("--rows", type=int, default=1500, help="Approximate number of rows (default 1500)")
    ap.add_argument("--out", type=str, default="synthetic_transactions.csv", help="Output CSV path")
    ap.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    args = ap.parse_args()
    random.seed(args.seed)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    rows_per_category = max(10, args.rows // len(TEMPLATES))
    rows_written = 0

    with open(out_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["description", "category"])  # column 0 = text, column 1 = category
        for category, templates in TEMPLATES.items():
            for _ in range(rows_per_category):
                w.writerow(generate_row(category, templates))
                rows_written += 1

    # Add a few extra random rows to hit target
    remaining = args.rows - rows_written
    if remaining > 0:
        all_cats = list(TEMPLATES.items())
        with open(out_path, "a", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            for _ in range(remaining):
                cat, templates = random.choice(all_cats)
                w.writerow(generate_row(cat, templates))

    print(f"Wrote {out_path} with description (col 0) and category (col 1). Use as dataset in your notebook.")


if __name__ == "__main__":
    main()
