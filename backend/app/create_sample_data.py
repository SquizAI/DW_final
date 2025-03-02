import os
import pandas as pd
import numpy as np
from pathlib import Path
import random
from datetime import datetime, timedelta

# Create sample data directory
SAMPLE_DIR = Path(os.path.dirname(os.path.dirname(__file__))) / "data" / "samples"
SAMPLE_DIR.mkdir(parents=True, exist_ok=True)

def create_customer_segmentation_data():
    """Create a sample customer segmentation dataset"""
    # Number of customers
    n_customers = 1000
    
    # Generate customer IDs
    customer_ids = [f"CUST-{i:05d}" for i in range(1, n_customers + 1)]
    
    # Generate demographic data
    ages = np.random.normal(45, 15, n_customers).astype(int)
    ages = np.clip(ages, 18, 90)  # Clip ages to reasonable range
    
    genders = np.random.choice(['Male', 'Female', 'Other'], n_customers, p=[0.48, 0.48, 0.04])
    
    income_brackets = np.random.choice(
        ['0-25K', '25K-50K', '50K-75K', '75K-100K', '100K-150K', '150K+'],
        n_customers,
        p=[0.15, 0.25, 0.25, 0.15, 0.1, 0.1]
    )
    
    locations = np.random.choice(
        ['Urban', 'Suburban', 'Rural'],
        n_customers,
        p=[0.6, 0.3, 0.1]
    )
    
    # Generate purchase behavior
    purchase_frequencies = np.random.choice(
        ['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Yearly'],
        n_customers,
        p=[0.1, 0.2, 0.4, 0.2, 0.1]
    )
    
    avg_purchase_values = np.zeros(n_customers)
    for i, income in enumerate(income_brackets):
        if income == '0-25K':
            avg_purchase_values[i] = np.random.normal(25, 10)
        elif income == '25K-50K':
            avg_purchase_values[i] = np.random.normal(50, 15)
        elif income == '50K-75K':
            avg_purchase_values[i] = np.random.normal(75, 20)
        elif income == '75K-100K':
            avg_purchase_values[i] = np.random.normal(100, 25)
        elif income == '100K-150K':
            avg_purchase_values[i] = np.random.normal(150, 35)
        else:  # 150K+
            avg_purchase_values[i] = np.random.normal(250, 75)
    
    avg_purchase_values = np.clip(avg_purchase_values, 10, 500).round(2)
    
    # Generate product preferences
    product_categories = ['Electronics', 'Clothing', 'Home Goods', 'Food', 'Beauty', 'Sports']
    preferred_categories = []
    
    for i in range(n_customers):
        # Each customer has 1-3 preferred categories
        n_preferences = np.random.randint(1, 4)
        preferred = np.random.choice(product_categories, n_preferences, replace=False)
        preferred_categories.append(', '.join(preferred))
    
    # Generate loyalty metrics
    customer_tenures = np.random.randint(1, 120, n_customers)  # Months
    
    loyalty_scores = np.zeros(n_customers)
    for i in range(n_customers):
        # Loyalty score based on tenure and purchase frequency
        base_score = customer_tenures[i] / 12  # Years as customer
        
        # Adjust based on purchase frequency
        freq_multiplier = {
            'Weekly': 2.0,
            'Bi-weekly': 1.5,
            'Monthly': 1.0,
            'Quarterly': 0.7,
            'Yearly': 0.3
        }
        
        loyalty_scores[i] = base_score * freq_multiplier[purchase_frequencies[i]]
    
    loyalty_scores = np.clip(loyalty_scores, 0, 10).round(1)
    
    # Generate engagement metrics
    email_open_rates = np.random.beta(2, 5, n_customers).round(2)
    social_media_engagement = np.random.choice(
        ['None', 'Low', 'Medium', 'High'],
        n_customers,
        p=[0.3, 0.3, 0.3, 0.1]
    )
    
    # Generate satisfaction scores
    satisfaction_scores = np.random.normal(7, 2, n_customers).round(1)
    satisfaction_scores = np.clip(satisfaction_scores, 1, 10)
    
    # Create DataFrame
    df = pd.DataFrame({
        'customer_id': customer_ids,
        'age': ages,
        'gender': genders,
        'income_bracket': income_brackets,
        'location': locations,
        'purchase_frequency': purchase_frequencies,
        'avg_purchase_value': avg_purchase_values,
        'preferred_categories': preferred_categories,
        'customer_tenure_months': customer_tenures,
        'loyalty_score': loyalty_scores,
        'email_open_rate': email_open_rates,
        'social_media_engagement': social_media_engagement,
        'satisfaction_score': satisfaction_scores
    })
    
    # Save to CSV
    file_path = SAMPLE_DIR / "customer_segmentation.csv"
    df.to_csv(file_path, index=False)
    print(f"Created customer segmentation dataset: {file_path}")
    
    return file_path

def create_sales_analysis_data():
    """Create a sample sales analysis dataset"""
    # Generate dates for the past 2 years
    end_date = datetime.now()
    start_date = end_date - timedelta(days=730)  # Approximately 2 years
    
    dates = []
    current_date = start_date
    while current_date <= end_date:
        dates.append(current_date)
        current_date += timedelta(days=1)
    
    # Number of records (multiple sales per day)
    n_records = 5000
    
    # Sample dates from the date range, with more recent dates having higher probability
    weights = np.linspace(0.5, 1.0, len(dates))
    sampled_dates = np.random.choice(dates, n_records, p=weights/weights.sum())
    
    # Generate product data
    product_categories = ['Electronics', 'Clothing', 'Home Goods', 'Food', 'Beauty', 'Sports']
    categories = np.random.choice(product_categories, n_records)
    
    products = []
    prices = []
    
    for category in categories:
        if category == 'Electronics':
            product = np.random.choice(['Laptop', 'Smartphone', 'Tablet', 'Headphones', 'TV'])
            price = np.random.normal(800, 300)
        elif category == 'Clothing':
            product = np.random.choice(['T-shirt', 'Jeans', 'Dress', 'Jacket', 'Shoes'])
            price = np.random.normal(60, 30)
        elif category == 'Home Goods':
            product = np.random.choice(['Sofa', 'Bed', 'Table', 'Chair', 'Lamp'])
            price = np.random.normal(200, 150)
        elif category == 'Food':
            product = np.random.choice(['Groceries', 'Snacks', 'Beverages', 'Meal Kit', 'Specialty'])
            price = np.random.normal(40, 20)
        elif category == 'Beauty':
            product = np.random.choice(['Skincare', 'Makeup', 'Fragrance', 'Haircare', 'Bath & Body'])
            price = np.random.normal(50, 25)
        else:  # Sports
            product = np.random.choice(['Fitness Equipment', 'Sportswear', 'Outdoor Gear', 'Team Sports', 'Accessories'])
            price = np.random.normal(100, 50)
        
        products.append(product)
        prices.append(max(5, price))  # Ensure minimum price of $5
    
    # Generate quantities
    quantities = np.random.randint(1, 6, n_records)
    
    # Calculate total sales
    total_sales = (np.array(prices) * quantities).round(2)
    
    # Generate customer IDs
    customer_ids = [f"CUST-{np.random.randint(1, 1001):05d}" for _ in range(n_records)]
    
    # Generate store locations
    store_locations = np.random.choice(
        ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
        n_records
    )
    
    # Generate payment methods
    payment_methods = np.random.choice(
        ['Credit Card', 'Debit Card', 'Cash', 'PayPal', 'Apple Pay', 'Google Pay'],
        n_records,
        p=[0.4, 0.3, 0.1, 0.1, 0.05, 0.05]
    )
    
    # Create DataFrame
    df = pd.DataFrame({
        'date': sampled_dates,
        'customer_id': customer_ids,
        'product_category': categories,
        'product': products,
        'price': np.round(prices, 2),
        'quantity': quantities,
        'total_sale': total_sales,
        'store_location': store_locations,
        'payment_method': payment_methods
    })
    
    # Sort by date
    df = df.sort_values('date')
    
    # Save to CSV
    file_path = SAMPLE_DIR / "sales_analysis.csv"
    df.to_csv(file_path, index=False)
    print(f"Created sales analysis dataset: {file_path}")
    
    return file_path

def create_product_analytics_data():
    """Create a sample product analytics dataset"""
    # Number of products
    n_products = 100
    
    # Number of days to generate data for
    n_days = 30
    
    # Total number of records
    n_records = 3000
    
    # Generate product IDs
    product_ids = [f"PROD-{i:05d}" for i in range(1, n_products + 1)]
    
    # Generate dates for the past month
    end_date = datetime.now()
    start_date = end_date - timedelta(days=n_days)
    
    dates = []
    current_date = start_date
    while current_date <= end_date:
        dates.append(current_date)
        current_date += timedelta(days=1)
    
    # Generate records
    sampled_products = np.random.choice(product_ids, n_records)
    sampled_dates = np.random.choice(dates, n_records)
    
    # Generate product categories
    categories = []
    for product_id in sampled_products:
        product_num = int(product_id.split('-')[1])
        if product_num <= 20:
            categories.append('Electronics')
        elif product_num <= 40:
            categories.append('Clothing')
        elif product_num <= 60:
            categories.append('Home Goods')
        elif product_num <= 80:
            categories.append('Food')
        else:
            categories.append('Beauty')
    
    # Generate views, add to cart, and purchase metrics
    views = np.random.randint(10, 1000, n_records)
    
    add_to_cart_rates = []
    purchase_rates = []
    
    for category in categories:
        if category == 'Electronics':
            add_to_cart_rate = np.random.beta(2, 8)
            purchase_rate = np.random.beta(1, 4)
        elif category == 'Clothing':
            add_to_cart_rate = np.random.beta(3, 7)
            purchase_rate = np.random.beta(2, 5)
        elif category == 'Home Goods':
            add_to_cart_rate = np.random.beta(2, 6)
            purchase_rate = np.random.beta(1, 3)
        elif category == 'Food':
            add_to_cart_rate = np.random.beta(4, 6)
            purchase_rate = np.random.beta(3, 4)
        else:  # Beauty
            add_to_cart_rate = np.random.beta(3, 8)
            purchase_rate = np.random.beta(2, 6)
        
        add_to_cart_rates.append(add_to_cart_rate)
        purchase_rates.append(purchase_rate)
    
    add_to_cart = (views * np.array(add_to_cart_rates)).astype(int)
    purchases = (add_to_cart * np.array(purchase_rates)).astype(int)
    
    # Ensure purchases <= add_to_cart <= views
    add_to_cart = np.minimum(add_to_cart, views)
    purchases = np.minimum(purchases, add_to_cart)
    
    # Generate revenue
    revenue = []
    for i, category in enumerate(categories):
        if category == 'Electronics':
            avg_price = np.random.normal(800, 300)
        elif category == 'Clothing':
            avg_price = np.random.normal(60, 30)
        elif category == 'Home Goods':
            avg_price = np.random.normal(200, 150)
        elif category == 'Food':
            avg_price = np.random.normal(40, 20)
        else:  # Beauty
            avg_price = np.random.normal(50, 25)
        
        avg_price = max(5, avg_price)  # Ensure minimum price of $5
        revenue.append(purchases[i] * avg_price)
    
    # Generate user metrics
    new_users = (views * np.random.beta(1, 10, n_records)).astype(int)
    returning_users = views - new_users
    
    # Generate engagement metrics
    avg_time_on_page = np.random.normal(120, 60, n_records).astype(int)  # seconds
    avg_time_on_page = np.clip(avg_time_on_page, 10, 300)  # Clip to reasonable range
    
    bounce_rates = np.random.beta(2, 8, n_records).round(2)
    
    # Create DataFrame
    df = pd.DataFrame({
        'date': sampled_dates,
        'product_id': sampled_products,
        'category': categories,
        'views': views,
        'add_to_cart': add_to_cart,
        'purchases': purchases,
        'revenue': np.round(revenue, 2),
        'new_users': new_users,
        'returning_users': returning_users,
        'avg_time_on_page_seconds': avg_time_on_page,
        'bounce_rate': bounce_rates
    })
    
    # Sort by date and product
    df = df.sort_values(['date', 'product_id'])
    
    # Save to CSV
    file_path = SAMPLE_DIR / "product_analytics.csv"
    df.to_csv(file_path, index=False)
    print(f"Created product analytics dataset: {file_path}")
    
    return file_path

def main():
    """Create all sample datasets"""
    print("Creating sample datasets...")
    create_customer_segmentation_data()
    create_sales_analysis_data()
    create_product_analytics_data()
    print("Sample datasets created successfully!")

if __name__ == "__main__":
    main() 