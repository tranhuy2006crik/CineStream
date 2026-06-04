import re
import json
import random

titles = ['Deadpool & Wolverine', 'Inside Out 2', 'Dune: Part Two', 'Godzilla x Kong', 'Kung Fu Panda 4', 
          'Oppenheimer', 'Barbie', 'Spider-Man: Across the Spider-Verse', 'The Batman', 'Avatar: The Way of Water',
          'Fast X', 'Mission: Impossible', 'Guardians of the Galaxy Vol. 3', 'John Wick 4', 'Transformers: Rise of the Beasts']

movies = []
for idx, title in enumerate(titles):
    movies.append({
        'title': title,
        'director': 'Director ' + str(idx),
        'duration': random.randint(90, 180),
        'releaseDate': 'new Date("2024-01-01")',
        'description': f'A great movie called {title}.',
        'poster': 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
        'banner': 'https://image.tmdb.org/t/p/original/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg',
        'trailerUrl': 'https://www.youtube.com/watch?v=73_1biulkYk',
        'cast': ['Actor A', 'Actor B'],
        'views': random.randint(1000, 50000),
        'ticketsSold': random.randint(500, 20000),
        'status': 'Showing',
        'isVOD': False
    })

movies_str = '[\n'
for m in movies:
    m_str = '      {\n'
    m_str += f"        title: '{m['title']}',\n"
    m_str += f"        director: '{m['director']}',\n"
    m_str += f"        duration: {m['duration']},\n"
    m_str += f"        releaseDate: {m['releaseDate']},\n"
    m_str += f"        description: '{m['description']}',\n"
    m_str += f"        poster: '{m['poster']}',\n"
    m_str += f"        banner: '{m['banner']}',\n"
    m_str += f"        trailerUrl: '{m['trailerUrl']}',\n"
    m_str += f"        cast: {json.dumps(m['cast'])},\n"
    m_str += f"        views: {m['views']},\n"
    m_str += f"        ticketsSold: {m['ticketsSold']},\n"
    m_str += f"        status: '{m['status']}',\n"
    m_str += f"        isVOD: {str(m['isVOD']).lower()}\n"
    m_str += '      },\n'
movies_str += '    ]'

with open('seed.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_content = re.sub(r'const moviesData = await Movie\.insertMany\(\[.*?\]\);', 'const moviesData = await Movie.insertMany(' + movies_str + ');', content, flags=re.DOTALL)

with open('seed.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
