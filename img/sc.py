# python script to exact image from site

import requests
from bs4 import BeautifulSoup


def get_image(url):
    r = requests.get(url)
    soup = BeautifulSoup(r.text, 'html.parser')
    img = soup.find('img')
    return img['src']


with open('links.txt', 'r') as f:
    for line in f:
        url = line.strip()
        img_url = get_image(url)
        print(img_url)
        r = requests.get(img_url)
