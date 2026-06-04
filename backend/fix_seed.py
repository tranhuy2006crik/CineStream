import sys
import re
import json

movies_info = [
    {
        "title": "Deadpool & Wolverine",
        "director": "Shawn Levy",
        "poster": "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
        "trailerUrl": "https://www.youtube.com/watch?v=73_1biulkYk",
        "cast": ["Ryan Reynolds", "Hugh Jackman", "Emma Corrin"]
    },
    {
        "title": "Inside Out 2",
        "director": "Kelsey Mann",
        "poster": "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
        "trailerUrl": "https://www.youtube.com/watch?v=LEjhY15eCx0",
        "cast": ["Amy Poehler", "Maya Hawke", "Kensington Tallman"]
    },
    {
        "title": "Dune: Part Two",
        "director": "Denis Villeneuve",
        "poster": "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGvwcAA.jpg",
        "trailerUrl": "https://www.youtube.com/watch?v=Way9Dexny3w",
        "cast": ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"]
    },
    {
        "title": "Godzilla x Kong",
        "director": "Adam Wingard",
        "poster": "https://image.tmdb.org/t/p/w500/tMefBSflR6PGQLvLuPEvtPTNapi.jpg",
        "trailerUrl": "https://www.youtube.com/watch?v=lV1OOlGwExM",
        "cast": ["Rebecca Hall", "Brian Tyree Henry", "Dan Stevens"]
    },
    {
        "title": "Kung Fu Panda 4",
        "director": "Mike Mitchell",
        "poster": "https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
        "trailerUrl": "https://www.youtube.com/watch?v=_inKs4eeHiI",
        "cast": ["Jack Black", "Awkwafina", "Viola Davis"]
    },
    {
        "title": "Oppenheimer",
        "director": "Christopher Nolan",
        "poster": "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        "trailerUrl": "https://www.youtube.com/watch?v=bK6ldnjE3Y0",
        "cast": ["Cillian Murphy", "Emily Blunt", "Robert Downey Jr."]
    },
    {
        "title": "Barbie",
        "director": "Greta Gerwig",
        "poster": "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
        "trailerUrl": "https://www.youtube.com/watch?v=pBk4NYhWNMM",
        "cast": ["Margot Robbie", "Ryan Gosling", "America Ferrera"]
    },
    {
        "title": "Spider-Man: Across the Spider-Verse",
        "director": "Joaquim Dos Santos",
        "poster": "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
        "trailerUrl": "https://www.youtube.com/watch?v=shW9i6k8cB0",
        "cast": ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"]
    },
    {
        "title": "The Batman",
        "director": "Matt Reeves",
        "poster": "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
        "trailerUrl": "https://www.youtube.com/watch?v=mqqft2x_Aa4",
        "cast": ["Robert Pattinson", "Zoë Kravitz", "Paul Dano"]
    },
    {
        "title": "Avatar: The Way of Water",
        "director": "James Cameron",
        "poster": "https://image.tmdb.org/t/p/w500/t6HIqrHezINNdVGjT5l0x44h2L.jpg",
        "trailerUrl": "https://www.youtube.com/watch?v=d9MyW72ELq0",
        "cast": ["Sam Worthington", "Zoe Saldaña", "Sigourney Weaver"]
    },
    {
        "title": "Fast X",
        "director": "Louis Leterrier",
        "poster": "https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclRVc.jpg",
        "trailerUrl": "https://www.youtube.com/watch?v=32RAq6LSotU",
        "cast": ["Vin Diesel", "Michelle Rodriguez", "Jason Momoa"]
    },
    {
        "title": "Mission: Impossible - Dead Reckoning",
        "director": "Christopher McQuarrie",
        "poster": "https://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg",
        "trailerUrl": "https://www.youtube.com/watch?v=avz06PDqDbM",
        "cast": ["Tom Cruise", "Hayley Atwell", "Ving Rhames"]
    },
    {
        "title": "Guardians of the Galaxy Vol. 3",
        "director": "James Gunn",
        "poster": "https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
        "trailerUrl": "https://www.youtube.com/watch?v=u3V5KDHRQvk",
        "cast": ["Chris Pratt", "Zoe Saldaña", "Dave Bautista"]
    },
    {
        "title": "John Wick: Chapter 4",
        "director": "Chad Stahelski",
        "poster": "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
        "trailerUrl": "https://www.youtube.com/watch?v=qEVUtrk8_B4",
        "cast": ["Keanu Reeves", "Donnie Yen", "Bill Skarsgård"]
    },
    {
        "title": "Transformers: Rise of the Beasts",
        "director": "Steven Caple Jr.",
        "poster": "https://image.tmdb.org/t/p/w500/gPbM0MK8CP8A174rmUwGsADNYKD.jpg",
        "trailerUrl": "https://www.youtube.com/watch?v=itnqEauWQZM",
        "cast": ["Anthony Ramos", "Dominique Fishback", "Peter Cullen"]
    }
]

import random

movies_str = '[\n'
for i, m in enumerate(movies_info):
    m_str = '      {\n'
    m_str += f"        title: '{m['title']}',\n"
    m_str += f"        director: '{m['director']}',\n"
    m_str += f"        duration: {90 + (i * 10) % 60},\n"
    m_str += f"        releaseDate: new Date('2024-01-01'),\n"
    m_str += f"        description: 'A great movie called {m['title']}',\n"
    m_str += f"        poster: '{m['poster']}',\n"
    m_str += f"        banner: 'https://image.tmdb.org/t/p/original/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg',\n"
    m_str += f"        trailerUrl: '{m['trailerUrl']}',\n"
    m_str += f"        cast: {json.dumps(m['cast'])},\n"
    m_str += f"        views: {10000 + i * 1500},\n"
    m_str += f"        ticketsSold: {5000 + i * 1200},\n"
    m_str += f"        status: 'Showing',\n"
    m_str += f"        isVOD: false\n"
    m_str += '      },\n'
movies_str += '    ]'

with open('seed.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the titles map block back to the array block
new_content = re.sub(r"const titles = \[.*?\];.*?const moviesList = titles.map.*?\}\)\);.*?const moviesData = await Movie\.insertMany\(moviesList\);", "const moviesData = await Movie.insertMany(" + movies_str + ");", content, flags=re.DOTALL)

with open('seed.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
