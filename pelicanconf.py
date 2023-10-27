AUTHOR = 'Sam'
SITENAME = 'Docs'
SITEURL = ''

PATH = 'content'
OUTPUT_PATH = 'docs'

TIMEZONE = 'Europe/Rome'
# STATIC_PATHS = ['blog', 'downloads']
# ARTICLE_PATHS = ['blog']
ARTICLE_SAVE_AS = '{date:%Y}/{slug}.html'
ARTICLE_URL = '{date:%Y}/{slug}.html'

DEFAULT_LANG = 'en'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Blogroll
LINKS = (('Sam Anderson', 'https://wip-porfolio.replit.app/'),
         ('Findr - a React + AWS + Node, hand drawn website to find flat shares ', 'https://www.python.org/'),
         ('sa902 github', 'https://github.com/sa902'))

# Social widget
SOCIAL = (('You can add links in your config file', '#'),
          ('Another social link', '#'),)

DEFAULT_PAGINATION = False

# Uncomment following line if you want document-relative URLs when developing
#RELATIVE_URLS = True