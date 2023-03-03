from selenium import webdriver
from datetime import date as td_date, timedelta
from random import uniform
import json

BASE_URL = 'https://e-katanalotis.gov.gr'
PRODUCTS_CONFIG = {
    'url': BASE_URL,
    'output': './output/products.json',
    'script': '''
    return Array.from(
        Ember.Namespace.NAMESPACES_BY_ID['katanalotis-microsite']
        .__container__.cache['service:store'].recordArrayManager
        ._liveRecordArrays.product.content).map(({ id, _record }) => {
            return {
                id: parseInt(id),
                name: _record.name,
                category: _record.category,
                subcategory: _record.sub_category,
            }
        }
    )
    '''
}
CATEGORIES_CONFIG = {
    'url': BASE_URL + '/products/navbar',
    'output': './output/categories.json',
    'script': '''
    return Array.from(
        Ember.Namespace.NAMESPACES_BY_ID['katanalotis-microsite']
        .__container__.cache['service:store'].recordArrayManager
        ._liveRecordArrays.category.content).map(({ _record }) => {
            return {
                id: _record.uuid,
                name: _record.name,
                subcategories: _record.sub_categories.map(({ name, uuid }) => {
                    return { name, id: uuid }
                })
            }
        }
    )
    '''
}
PRICES_CONFIG = {
    'output': './output/prices.json',
    'date_diff': 8,
    'base_start_price': 1.00,
    'max_deviation': 0.10,
}

if __name__ == '__main__':
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)

    # Products
    driver.get(PRODUCTS_CONFIG['url'])
    products = driver.execute_script(PRODUCTS_CONFIG['script'])\

    # Categories
    driver.get(CATEGORIES_CONFIG['url'])
    categories = driver.execute_script(CATEGORIES_CONFIG['script'])

    # Prices
    prices = []
    for product in products:
        product_prices = []
        # For each product generate a random base price
        start_price = PRICES_CONFIG['base_start_price'] + round(uniform(0, 3), 2)
        for day in range(PRICES_CONFIG['date_diff']):
            date = (td_date.today() - timedelta(days=day)).strftime('%Y-%m-%d')
            # For each day generate a random price based on the base price
            price = round(start_price + round(uniform(0, PRICES_CONFIG['max_deviation']), 2), 2)
            product_prices.append({
                'date': date,
                'price': price
            })

        prices.append({
            'id': product['id'],
            'prices': product_prices
        })

    driver.quit()

    # Write to files
    with open(PRODUCTS_CONFIG['output'], 'w', encoding='utf-8') as file:
        json.dump(products, file, indent=2, ensure_ascii=False)

    with open(CATEGORIES_CONFIG['output'], 'w', encoding='utf-8') as file:
        json.dump(categories, file, indent=2, ensure_ascii=False)

    with open(PRICES_CONFIG['output'], 'w', encoding='utf-8') as file:
        json.dump(prices, file, indent=2, ensure_ascii=False)
