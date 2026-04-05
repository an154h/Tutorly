"""
Seed the database with sample subjects, topics, questions, and demo students.
Safe to run multiple times — uses ON CONFLICT DO NOTHING.
Run from the project root: python backend/seed.py
"""
import json
import sys
import pathlib
from dotenv import load_dotenv

load_dotenv(pathlib.Path(__file__).parent.parent / '.env')
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from db import get_db, init_db

# Ensure tables exist before seeding
init_db()

# ---------------------------------------------------------------------------
# Seed data
# ---------------------------------------------------------------------------

SUBJECTS = [
    {'name': 'Mathematics',       'code': '0580', 'icon': '📐'},
    {'name': 'English Language',  'code': '0500', 'icon': '📖'},
    {'name': 'Biology',           'code': '0610', 'icon': '🔬'},
]

# topics[subject_code] = [topic_name, ...]
TOPICS = {
    '0580': ['Number and Algebra', 'Geometry and Mensuration', 'Statistics and Probability'],
    '0500': ['Reading Comprehension', 'Summary Writing', 'Directed Writing'],
    '0610': ['Cell Biology', 'Human Physiology', 'Ecology and Environment'],
}

# questions[(subject_code, topic_name)] = [question_dict, ...]
QUESTIONS = {
    ('0580', 'Number and Algebra'): [
        {
            'question_text': 'Solve the simultaneous equations: 3x + 2y = 12 and x − y = 1. Show your working.',
            'marks': 4,
            'difficulty': 'medium',
            'years_appeared': [2018, 2020, 2022, 2023],
            'hint_stages': [
                'Try making one variable the subject of the simpler equation first.',
                'From x − y = 1, you can write x = 1 + y. Now substitute that into the first equation.',
                'After substituting, you should get 3(1 + y) + 2y = 12. Expand the brackets and collect like terms.',
            ],
            'answer': 'From x − y = 1: x = 1 + y. Substituting into 3x + 2y = 12: 3(1 + y) + 2y = 12 → 3 + 3y + 2y = 12 → 5y = 9 → y = 9/5 = 1.8. Then x = 1 + 1.8 = 2.8. Solution: x = 2.8, y = 1.8.',
        },
        {
            'question_text': 'Factorise completely: 6x² − 13x − 5.',
            'marks': 3,
            'difficulty': 'medium',
            'years_appeared': [2019, 2021, 2023],
            'hint_stages': [
                'Look for two numbers that multiply to (6 × −5) = −30 and add to −13.',
                'The two numbers are −15 and 2. Rewrite the middle term: 6x² − 15x + 2x − 5.',
                'Now group and factorise in pairs: 3x(2x − 5) + 1(2x − 5).',
            ],
            'answer': '6x² − 13x − 5 = 6x² − 15x + 2x − 5 = 3x(2x − 5) + 1(2x − 5) = (3x + 1)(2x − 5).',
        },
        {
            'question_text': 'A sequence has nth term 4n − 3. Write down the first four terms and find which term equals 97.',
            'marks': 3,
            'difficulty': 'easy',
            'years_appeared': [2017, 2019, 2020, 2022],
            'hint_stages': [
                'Substitute n = 1, 2, 3, 4 into 4n − 3 to get the first four terms.',
                'To find which term equals 97, set 4n − 3 = 97 and solve for n.',
            ],
            'answer': 'First four terms: 1, 5, 9, 13. To find which term equals 97: 4n − 3 = 97 → 4n = 100 → n = 25. The 25th term equals 97.',
        },
        {
            'question_text': 'Express 0.000345 in standard form.',
            'marks': 1,
            'difficulty': 'easy',
            'years_appeared': [2018, 2021, 2022, 2023, 2024],
            'hint_stages': [
                'Standard form is a × 10^n where 1 ≤ a < 10. Move the decimal point until you have a number between 1 and 10.',
            ],
            'answer': '0.000345 = 3.45 × 10⁻⁴',
        },
        {
            'question_text': 'The function f(x) = x² − 3x + 1. Find f(−2) and solve f(x) = 0, giving answers to 2 decimal places.',
            'marks': 5,
            'difficulty': 'hard',
            'years_appeared': [2020, 2022, 2023],
            'hint_stages': [
                'For f(−2), substitute x = −2 directly into the expression.',
                'To solve f(x) = 0, use the quadratic formula: x = (−b ± √(b²−4ac)) / 2a.',
                'Identify a = 1, b = −3, c = 1, then calculate the discriminant b² − 4ac first.',
            ],
            'answer': 'f(−2) = (−2)² − 3(−2) + 1 = 4 + 6 + 1 = 11. For f(x) = 0: using the quadratic formula with a=1, b=−3, c=1: discriminant = 9 − 4 = 5. x = (3 ± √5) / 2. x = 2.62 or x = 0.38 (both to 2 d.p.).',
        },
    ],
    ('0580', 'Geometry and Mensuration'): [
        {
            'question_text': 'A circle has radius 7 cm. Calculate its area and circumference, giving answers in terms of π.',
            'marks': 3,
            'difficulty': 'easy',
            'years_appeared': [2017, 2018, 2020, 2021, 2023],
            'hint_stages': [
                'Area of a circle = πr². Circumference = 2πr. Substitute r = 7.',
            ],
            'answer': 'Area = πr² = π × 7² = 49π cm². Circumference = 2πr = 2π × 7 = 14π cm.',
        },
        {
            'question_text': 'Triangle ABC has AB = 8 cm, BC = 6 cm and angle ABC = 90°. Calculate the length of AC and the size of angle BAC.',
            'marks': 4,
            'difficulty': 'medium',
            'years_appeared': [2019, 2021, 2022],
            'hint_stages': [
                'Since angle ABC = 90°, AC is the hypotenuse. Use Pythagoras: AC² = AB² + BC².',
                'Once you have AC, use trigonometry to find angle BAC. Which ratio links the opposite and hypotenuse from angle BAC?',
            ],
            'answer': 'AC² = 8² + 6² = 64 + 36 = 100, so AC = 10 cm. For angle BAC: sin(BAC) = BC/AC = 6/10 = 0.6, so angle BAC = sin⁻¹(0.6) ≈ 36.87° ≈ 36.9°.',
        },
        {
            'question_text': 'A cylinder has radius 5 cm and height 12 cm. Calculate its volume and total surface area. Give answers to 3 significant figures.',
            'marks': 5,
            'difficulty': 'medium',
            'years_appeared': [2018, 2020, 2022, 2023],
            'hint_stages': [
                'Volume of a cylinder = πr²h.',
                'Total surface area = 2πr² (two circular ends) + 2πrh (curved surface).',
            ],
            'answer': 'Volume = πr²h = π × 25 × 12 = 300π ≈ 942 cm³ (3 s.f.). Total surface area = 2πr² + 2πrh = 2π(25) + 2π(5)(12) = 50π + 120π = 170π ≈ 534 cm² (3 s.f.).',
        },
        {
            'question_text': 'Using a ruler and compasses only, construct the perpendicular bisector of line segment PQ where PQ = 10 cm. Describe the locus of points equidistant from P and Q.',
            'marks': 4,
            'difficulty': 'medium',
            'years_appeared': [2017, 2019, 2021, 2024],
            'hint_stages': [
                'Open your compasses to more than half the length of PQ. Draw arcs from both P and Q that intersect above and below the line.',
                'Join the two intersection points — that line is the perpendicular bisector. Every point on it is equidistant from P and Q.',
            ],
            'answer': 'Set compasses to more than 5 cm. With centre P, draw arcs above and below PQ. Repeat with centre Q using the same radius. Join the two intersection points. This line is the perpendicular bisector of PQ. The locus of points equidistant from P and Q is the perpendicular bisector of PQ — a straight line passing through the midpoint of PQ at 90°.',
        },
    ],
    ('0580', 'Statistics and Probability'): [
        {
            'question_text': 'The ages of 8 students are: 14, 15, 14, 16, 15, 14, 17, 15. Find the mean, median and mode.',
            'marks': 4,
            'difficulty': 'easy',
            'years_appeared': [2017, 2019, 2021, 2022, 2023],
            'hint_stages': [
                'Mean = sum of all values ÷ number of values.',
                'For the median, arrange the values in order and find the middle value (or average of two middle values for an even count).',
                'Mode is the value that appears most often.',
            ],
            'answer': 'Ordered: 14, 14, 14, 15, 15, 15, 16, 17. Mean = (14+15+14+16+15+14+17+15) ÷ 8 = 120 ÷ 8 = 15. Median = average of 4th and 5th values = (15+15) ÷ 2 = 15. Mode = 14 (appears 3 times).',
        },
        {
            'question_text': 'A bag contains 3 red, 4 blue and 5 green counters. One counter is drawn at random. Find the probability it is (a) green, (b) not blue.',
            'marks': 3,
            'difficulty': 'easy',
            'years_appeared': [2018, 2020, 2021, 2023, 2024],
            'hint_stages': [
                'Total number of counters = 3 + 4 + 5 = 12. Probability = favourable outcomes ÷ total outcomes.',
                'For "not blue", either count the non-blue counters directly, or use P(not blue) = 1 − P(blue).',
            ],
            'answer': 'Total counters = 12. (a) P(green) = 5/12. (b) P(not blue) = 1 − P(blue) = 1 − 4/12 = 8/12 = 2/3.',
        },
        {
            'question_text': 'Two fair dice are rolled. Draw a sample space diagram and find the probability that the sum of the two scores is greater than 8.',
            'marks': 5,
            'difficulty': 'hard',
            'years_appeared': [2019, 2022, 2023],
            'hint_stages': [
                'A sample space diagram is a 6×6 grid showing all 36 possible outcomes.',
                'Fill in the sums for each cell. Then count how many cells have a sum greater than 8.',
                'Probability = (number of favourable outcomes) ÷ 36.',
            ],
            'answer': 'Total outcomes = 36. Sums greater than 8 (i.e. 9, 10, 11, 12): (3,6),(4,5),(5,4),(6,3) = 4 ways for sum 9; (4,6),(5,5),(6,4) = 3 ways for sum 10; (5,6),(6,5) = 2 ways for sum 11; (6,6) = 1 way for sum 12. Total favourable = 10. P(sum > 8) = 10/36 = 5/18.',
        },
    ],

    ('0500', 'Reading Comprehension'): [
        {
            'question_text': 'Read the passage carefully. Explain in your own words what the writer means by "the silence was deafening" (line 12). [2]',
            'marks': 2,
            'difficulty': 'easy',
            'years_appeared': [2018, 2020, 2021, 2022, 2023],
            'passage': (
                'The examination hall had never felt so large. Row after row of wooden desks stretched towards the far wall, each occupied by a student hunched over a paper. The invigilator paced slowly between the rows, her footsteps muffled by the thin carpet. Outside, a lawnmower droned somewhere in the distance, but inside, nothing moved. No one coughed. No one shuffled. No pen scratched against paper.\n\n'
                'Mia set down her pencil and looked up. Around her, thirty other students stared at their papers with the same fixed, glassy expression. She had written her name at the top of the page, the date below it, and nothing else. The questions blurred in front of her. She read the first one again. And again. The words made sense individually but arranged together they felt like a foreign language.\n\n'
                'She pressed her palms flat against the desk. The cool surface grounded her slightly. Three hours. She had three hours. Surely something would come to her. She glanced at the clock on the wall — only four minutes had passed since the exam began. The invigilator turned at the end of a row and began her slow walk back. The silence was deafening. Mia picked up her pencil and began to write.'
            ),
            'hint_stages': [
                'This is a figure of speech (paradox/oxymoron). Think about what "deafening" normally describes and why silence might feel that way.',
                'The idea is that the silence was so complete and intense that it had a strong, almost overwhelming effect on the people present.',
            ],
            'answer': 'The writer means that the silence was so profound and absolute that it felt overwhelming — almost as loud and forceful as a deafening noise. The paradox emphasises how intensely aware everyone was of the complete absence of sound, creating a powerful, unsettling atmosphere.',
        },
        {
            'question_text': 'Using details from paragraphs 3 and 4, explain how the writer creates a sense of tension. [4]',
            'marks': 4,
            'difficulty': 'medium',
            'years_appeared': [2017, 2019, 2021, 2023],
            'passage': (
                'The storm had been building for hours. From the kitchen window, Dani watched the sky turn the colour of a bruise — deep purple bleeding into yellow at the horizon. The wind had picked up shortly after noon, rattling the shutters and bending the palm trees in long, slow arcs. By mid-afternoon, the neighbours had already taped their windows and retreated indoors.\n\n'
                'Dani\'s mother had gone to the market that morning and had not returned. The market was only twelve minutes away by car. Dani had called twice and both times the phone rang out. He told himself the network was probably busy — everyone in the neighbourhood was calling someone right now. But the thought offered little comfort.\n\n'
                'He checked the front door again. Locked. He moved to the window. The street outside was completely empty, the usual sounds of traffic and children replaced by a thin, high whine of wind. A plastic chair from a neighbour\'s porch tumbled across the road. He pressed his hand against the glass and felt it vibrate. His breath fogged the pane.\n\n'
                'A branch struck the roof. Dani spun around, his heart hammering. Nothing. Just the house settling. He exhaled slowly and looked at the phone in his hand. Still no messages. He sat down on the floor beside the front door — the most solid wall in the house, his father had always said — pulled his knees to his chest, and waited.'
            ),
            'hint_stages': [
                'Look for specific language techniques: short sentences, sensory details, word choices, and imagery.',
                'For each point, quote briefly from the text and explain the effect on the reader.',
            ],
            'answer': 'Award marks for identifying specific techniques and explaining their effect. A full answer should include: (1) a quotation or reference from paragraphs 3–4, (2) identification of the technique (e.g. short sentences, sensory language, threatening imagery), and (3) explanation of how this creates tension for the reader. Four developed points, each quoting and explaining, would achieve full marks.',
        },
        {
            'question_text': 'How does the writer use language to convey the character\'s feelings of isolation in the final paragraph? [6]',
            'marks': 6,
            'difficulty': 'hard',
            'years_appeared': [2020, 2022, 2023],
            'passage': (
                'The village had not changed. That was what struck Ren most as he stepped off the bus — not the familiar smell of wet earth and woodsmoke, nor the sight of the old banyan tree still spreading its arms over the square, but the simple, astonishing fact of sameness. The same low rooftops. The same uneven road. The same stray dog sleeping in the same patch of shade.\n\n'
                'But Ren had changed. Eight years in the city had given him a different posture, a different vocabulary, a different way of looking at things. He stood in the square with his bag at his feet and waited to feel something — recognition, nostalgia, relief. Nothing arrived. The dog opened one eye, registered him, and went back to sleep.\n\n'
                'He walked to his aunt\'s house. She opened the door and greeted him warmly, pressed food into his hands, talked about relatives he barely remembered. He nodded and smiled and said the right things. Later, they sat on the porch together watching the evening come in. Insects sang in the tall grass. His aunt dozed in her chair. A motorbike passed at the end of the road, and then nothing.\n\n'
                'He was surrounded by everything he had come from. And yet the distance he felt was vast — not geographical but internal, a gulf that no amount of physical proximity could close. He looked out at the fields, grey and still in the fading light, and felt himself to be a very long way from anywhere.'
            ),
            'hint_stages': [
                'Identify the specific words and phrases that suggest isolation. Think about connotations.',
                'Consider the structure too: are sentences long or fragmented? Does the rhythm contribute to the mood?',
                'For a high-mark answer, explore the effect of at least three different language choices with quotations.',
            ],
            'answer': 'A full-mark answer identifies at least three language features (e.g. words with lonely/empty connotations, fragmented sentence structure, metaphors of emptiness or distance), quotes precisely from the final paragraph, and clearly explains how each choice conveys the character\'s emotional isolation. Structural comments (short sentences mimicking disconnection, lack of dialogue reinforcing loneliness) gain additional credit.',
        },
    ],
    ('0500', 'Summary Writing'): [
        {
            'question_text': 'Read the two texts about renewable energy. Write a summary of the arguments for and against solar power, as presented in both texts. Write no more than 120 words. [10]',
            'marks': 10,
            'difficulty': 'hard',
            'years_appeared': [2018, 2019, 2021, 2022, 2023],
            'passage': (
                'TEXT A\n\n'
                'Solar power has emerged as one of the most promising solutions to the global energy crisis. Unlike fossil fuels, sunlight is an inexhaustible resource — the amount of solar energy that strikes the Earth in a single hour is enough to power human civilisation for an entire year. Advances in photovoltaic technology have driven the cost of solar panels down by over 90% in the past decade, making them increasingly affordable for households and businesses alike. Countries that have invested heavily in solar infrastructure, such as Germany and China, have seen significant reductions in their carbon emissions. Proponents argue that a global transition to solar energy is not only desirable but economically inevitable.\n\n'
                'TEXT B\n\n'
                'While solar power is often celebrated as a clean and limitless energy source, its limitations deserve serious consideration. Solar panels generate electricity only when the sun is shining — they are entirely ineffective at night and significantly less productive during cloudy weather or in regions with limited sunlight. Energy storage technology, in the form of large-scale batteries, remains expensive and environmentally costly to manufacture. Critics also point out that the production of solar panels relies on rare earth minerals, the mining of which causes considerable ecological damage. Furthermore, large solar farms require vast areas of land, which can disrupt local ecosystems and compete with agricultural use. Solar power, they argue, is one piece of the solution — not the whole answer.'
            ),
            'hint_stages': [
                'First, list the key points from each text separately — do not copy sentences. Identify arguments FOR solar power and arguments AGAINST.',
                'Use your own words to paraphrase each point. Aim for one sentence per point.',
                'Check your word count and ensure you have balanced coverage of both texts.',
            ],
            'answer': 'A full-mark summary identifies content points from both texts (up to 8 points), paraphrases them in the student\'s own words, and stays within 120 words. Marks are split: up to 8 for content (relevant points selected from the texts) and up to 2 for quality of language (clarity, own words, coherent structure). Copying from the text loses content marks.',
        },
        {
            'question_text': 'Summarise what the writer says about the challenges faced by young entrepreneurs. Use your own words as far as possible. [8]',
            'marks': 8,
            'difficulty': 'medium',
            'years_appeared': [2017, 2020, 2022, 2023],
            'passage': (
                'Starting a business has never been easy, but for young entrepreneurs — those under thirty — the obstacles can feel particularly daunting. The most immediate challenge is financial. Banks are notoriously reluctant to lend to individuals without a credit history or significant collateral, and many young founders exhaust their personal savings within the first year. Venture capital firms, while well-publicised, fund only a tiny fraction of the businesses that approach them, and they tend to favour founders with prior experience or existing industry connections.\n\n'
                'Beyond money, young entrepreneurs often struggle to be taken seriously. Clients, suppliers, and potential partners may question their credibility simply because of their age. One founder described attending a business meeting where the other party repeatedly directed questions to her older colleague rather than to her, despite the fact that the company was hers. Such experiences are common, and the psychological toll — the constant need to prove oneself — can be exhausting.\n\n'
                'There is also the matter of inexperience. Running a business requires knowledge across an enormous range of areas: accounting, marketing, employment law, supply chain management, customer relations. Universities prepare students well for specific disciplines but rarely for the broad, practical demands of entrepreneurship. Many young founders describe a steep and disorienting learning curve in the early months, making costly mistakes that a more experienced businessperson might have avoided.\n\n'
                'Finally, the personal cost should not be underestimated. Long hours, financial insecurity, and the weight of responsibility for employees can strain relationships and take a serious toll on mental health. For many young entrepreneurs, the question is not simply whether their business will succeed, but whether they themselves can endure the process of building it.'
            ),
            'hint_stages': [
                'Scan for every challenge mentioned — financial, social, practical. List them before writing.',
                'Paraphrase rather than copy. Replace key words with synonyms and restructure sentences.',
            ],
            'answer': 'A strong answer identifies all challenges mentioned in the text (typically 6–8 points) and paraphrases each one clearly. Common challenges include: lack of funding/capital, difficulty gaining trust from investors, limited business experience, work-life balance pressures, fear of failure, and competition from established businesses. Each point expressed in the student\'s own words scores a content mark.',
        },
        {
            'question_text': 'Using information from both passages, summarise the benefits of urban farming for local communities. [6]',
            'marks': 6,
            'difficulty': 'medium',
            'years_appeared': [2019, 2021, 2023, 2024],
            'passage': (
                'TEXT A\n\n'
                'In cities across the world, disused rooftops, vacant lots, and abandoned warehouses are being transformed into productive growing spaces. Urban farming — the practice of cultivating food within city boundaries — is gaining momentum as communities recognise its potential to address food insecurity, reduce environmental impact, and foster social cohesion. Fresh vegetables grown a few streets away arrive on the table with a fraction of the carbon footprint of produce transported from rural farms hundreds of kilometres distant. In some cities, urban farms have become social hubs where residents of different backgrounds work side by side, building relationships that extend well beyond the growing season.\n\n'
                'TEXT B\n\n'
                'The benefits of urban farming extend beyond the purely practical. Schools in several Bruneian municipalities have introduced small growing gardens as part of the curriculum, with students tending plots and learning about nutrition, ecology, and the origins of their food. Teachers report that the initiative has improved engagement, particularly among students who struggle with traditional classroom learning. Local councils have also pointed to the economic advantages: community gardens on previously derelict land have been linked to modest increases in surrounding property values and have provided part-time employment for residents who might otherwise struggle to find work. For city-dwellers increasingly disconnected from the natural world, access to green growing spaces has also been shown to improve mental wellbeing.'
            ),
            'hint_stages': [
                'Focus only on benefits — ignore any drawbacks mentioned in the texts.',
                'Draw points from both passages and blend them naturally in your summary.',
            ],
            'answer': 'A full answer draws benefits from both passages and paraphrases them. Benefits typically include: fresh produce available locally, reduced food miles/environmental impact, community cohesion, employment opportunities, educational value, use of unused urban space, and improved mental health for participants. Points must come from the texts and be expressed in the student\'s own words.',
        },
    ],
    ('0500', 'Directed Writing'): [
        {
            'question_text': 'Your school is considering banning mobile phones on school premises. Write a letter to the headteacher arguing either for or against this proposal. [20]',
            'marks': 20,
            'difficulty': 'hard',
            'years_appeared': [2017, 2018, 2020, 2021, 2022, 2023],
            'hint_stages': [
                'Plan your letter: introduction stating your position, 3–4 developed arguments, conclusion. Use formal letter format.',
                'For each argument, give a reason and a specific example or elaboration.',
                'Use persuasive techniques: rhetorical questions, statistics (invented if needed), direct address to the reader.',
            ],
            'answer': 'Marked out of 20: up to 10 for Content (clear position, 3–4 well-developed arguments with evidence/examples, persuasive techniques, appropriate conclusion) and up to 10 for Language (formal register, varied vocabulary and sentence structures, accurate grammar/punctuation/spelling, appropriate letter format with address, date, salutation and sign-off). Strong answers maintain a consistent, persuasive tone throughout.',
        },
        {
            'question_text': 'Write a speech to be delivered at a school assembly persuading students to volunteer in their local community. [20]',
            'marks': 20,
            'difficulty': 'hard',
            'years_appeared': [2019, 2021, 2022, 2023],
            'hint_stages': [
                'A speech needs to feel spoken: use "I", "you", "we". Open with a hook — a question, fact, or anecdote.',
                'Structure: opening hook → why volunteering matters → benefits to the volunteer → call to action.',
                'Use rhetorical devices: rule of three, repetition, rhetorical questions, emotive language.',
            ],
            'answer': 'Marked out of 20: up to 10 for Content (engaging opening, clear and convincing arguments about the value of volunteering, personal/emotional appeal, strong call to action) and up to 10 for Language (spoken/direct register using "you" and "we", rhetorical devices such as rule of three and rhetorical questions, varied and emotive vocabulary, accurate grammar). The speech should feel energetic and audience-aware throughout.',
        },
        {
            'question_text': 'Write a report for the school council on how the school canteen could be improved. Include findings and recommendations. [20]',
            'marks': 20,
            'difficulty': 'medium',
            'years_appeared': [2018, 2020, 2022, 2024],
            'hint_stages': [
                'A report uses headings: Introduction, Findings, Recommendations, Conclusion. Use formal language.',
                'Each finding should be supported by a reason or evidence. Recommendations should be practical and specific.',
            ],
            'answer': 'Marked out of 20: up to 10 for Content (clear introduction stating the report\'s purpose, at least 3 findings supported by reasons/evidence, practical and specific recommendations, brief conclusion) and up to 10 for Language (formal impersonal register, correct use of headings and subheadings, clear and precise vocabulary, accurate grammar/punctuation/spelling). Avoid personal opinions without evidence; present findings objectively.',
        },
    ],

    ('0610', 'Cell Biology'): [
        {
            'question_text': 'Describe the differences between plant cells and animal cells. [4]',
            'marks': 4,
            'difficulty': 'easy',
            'years_appeared': [2017, 2018, 2020, 2021, 2022, 2023],
            'hint_stages': [
                'Think about structures present in plant cells but not in animal cells.',
                'Key differences include: cell wall (plant only), chloroplasts (plant only), large permanent vacuole (plant only), and regular shape vs irregular shape.',
            ],
            'answer': 'Plant cells have: a cell wall (made of cellulose) for support; chloroplasts containing chlorophyll for photosynthesis; a large permanent central vacuole filled with cell sap; a regular, fixed shape. Animal cells lack all of these. Animal cells have an irregular shape and may contain small temporary vacuoles. Both cell types have a cell membrane, nucleus, cytoplasm, and mitochondria.',
        },
        {
            'question_text': 'Explain how the structure of the cell membrane allows it to control what enters and leaves the cell. [5]',
            'marks': 5,
            'difficulty': 'medium',
            'years_appeared': [2019, 2021, 2022, 2023],
            'hint_stages': [
                'Start with the phospholipid bilayer — what property does it have regarding water-soluble vs fat-soluble substances?',
                'Mention the protein channels/carriers embedded in the membrane and their role in transporting specific molecules.',
                'The membrane is selectively permeable — explain what this means in terms of what can and cannot pass through.',
            ],
            'answer': 'The cell membrane is a phospholipid bilayer — two layers of phospholipid molecules with hydrophilic heads facing outward and hydrophobic tails facing inward. This makes it impermeable to most water-soluble (polar) substances. Protein channels and carrier proteins embedded in the membrane allow specific ions and molecules (e.g. glucose, amino acids) to pass through by facilitated diffusion or active transport. The membrane is therefore selectively permeable — it controls which substances enter and leave based on size, charge, and solubility.',
        },
        {
            'question_text': 'Compare the processes of mitosis and meiosis, stating the purpose of each in the human body. [6]',
            'marks': 6,
            'difficulty': 'hard',
            'years_appeared': [2020, 2022, 2023],
            'hint_stages': [
                'Think about: number of divisions, number of daughter cells produced, chromosome number in daughter cells, and where each occurs.',
                'Mitosis: 1 division → 2 diploid cells (body growth and repair). Meiosis: 2 divisions → 4 haploid cells (gamete formation).',
            ],
            'answer': 'Mitosis: one division producing 2 genetically identical daughter cells; daughter cells are diploid (same chromosome number as parent, 46 in humans); occurs in body (somatic) cells; purpose is growth, repair, and asexual reproduction. Meiosis: two divisions producing 4 genetically different daughter cells; daughter cells are haploid (half the chromosome number, 23 in humans); occurs in reproductive organs (testes/ovaries); purpose is to produce gametes (sperm and egg cells) for sexual reproduction. Meiosis introduces genetic variation through crossing over and independent assortment.',
        },
        {
            'question_text': 'Define osmosis and explain what would happen to a red blood cell placed in a solution with a lower solute concentration than the cell contents. [4]',
            'marks': 4,
            'difficulty': 'medium',
            'years_appeared': [2018, 2019, 2021, 2022, 2024],
            'hint_stages': [
                'Osmosis is the movement of water molecules through a partially permeable membrane from a region of higher water potential to lower water potential.',
                'The solution outside has lower solute concentration = higher water potential. Which direction will water move by osmosis?',
                'Water will enter the cell. The cell swells and may burst (lyse) — what is the term for this?',
            ],
            'answer': 'Osmosis is the net movement of water molecules through a partially (selectively) permeable membrane from a region of higher water potential (lower solute concentration) to a region of lower water potential (higher solute concentration). The solution outside the red blood cell has a lower solute concentration, therefore a higher water potential. Water moves into the cell by osmosis down the water potential gradient. The cell swells and eventually bursts — this is called haemolysis (or lysis).',
        },
    ],
    ('0610', 'Human Physiology'): [
        {
            'question_text': 'Describe the role of the alveoli in gas exchange and explain how their structure makes them well-adapted for this function. [5]',
            'marks': 5,
            'difficulty': 'medium',
            'years_appeared': [2017, 2019, 2021, 2022, 2023],
            'hint_stages': [
                'List the structural features of alveoli: large surface area, thin walls, moist lining, rich blood supply.',
                'For each feature, explain how it aids gas exchange — link structure to function.',
            ],
            'answer': 'Alveoli are the site of gas exchange in the lungs. Oxygen diffuses from the alveoli into the blood; carbon dioxide diffuses from the blood into the alveoli to be exhaled. Adaptations: (1) Large surface area (millions of alveoli) — increases rate of diffusion; (2) Thin walls (one cell thick) — short diffusion distance; (3) Moist lining — gases dissolve before diffusing; (4) Rich capillary network — maintains a steep concentration gradient by continuously carrying oxygen away and bringing CO₂.',
        },
        {
            'question_text': 'Explain how the digestive system breaks down a piece of bread into molecules that can be absorbed into the bloodstream. [6]',
            'marks': 6,
            'difficulty': 'hard',
            'years_appeared': [2018, 2020, 2022, 2023],
            'hint_stages': [
                'Bread is mainly starch. Trace its journey: mouth (salivary amylase) → stomach → small intestine (pancreatic amylase).',
                'State the final product: starch → maltose → glucose. Explain absorption: glucose is absorbed by villi into blood capillaries by active transport.',
            ],
            'answer': 'Bread contains starch (a carbohydrate). Digestion: (1) Mouth — salivary amylase begins breaking starch into maltose; (2) Stomach — no starch digestion (acidic pH inactivates amylase); (3) Small intestine — pancreatic amylase continues breakdown to maltose; maltase on the intestinal wall converts maltose to glucose. Absorption: glucose molecules are small enough to be absorbed through the villi of the small intestine into the blood capillaries by active transport, then transported to the liver via the hepatic portal vein.',
        },
        {
            'question_text': 'Describe the role of insulin in regulating blood glucose concentration. [4]',
            'marks': 4,
            'difficulty': 'easy',
            'years_appeared': [2017, 2018, 2020, 2021, 2022, 2023, 2024],
            'hint_stages': [
                'Where is insulin produced, and what triggers its release?',
                'Insulin causes body cells (especially liver and muscle) to take up glucose from the blood and convert it to glycogen for storage.',
            ],
            'answer': 'Insulin is a hormone produced by the beta cells of the islets of Langerhans in the pancreas. When blood glucose rises (e.g. after a meal), the pancreas detects this and secretes insulin into the blood. Insulin causes: (1) body cells to increase glucose uptake from the blood; (2) liver and muscle cells to convert excess glucose into glycogen (glycogenesis) for storage. This lowers blood glucose back to the normal level. In Type 1 diabetes, the pancreas cannot produce insulin, so blood glucose remains dangerously high.',
        },
        {
            'question_text': 'Describe the double circulatory system in humans and explain the advantage of this arrangement. [5]',
            'marks': 5,
            'difficulty': 'medium',
            'years_appeared': [2019, 2021, 2023],
            'hint_stages': [
                'Double circulation means blood passes through the heart twice for each complete circuit. Name the two circuits.',
                'Pulmonary circuit: heart → lungs → heart. Systemic circuit: heart → body → heart.',
                'The advantage: oxygenated and deoxygenated blood are kept separate, and blood pressure is maintained high enough for efficient delivery to all organs.',
            ],
            'answer': 'In the double circulatory system, blood passes through the heart twice per complete circuit. Circuit 1 (pulmonary): right side of heart → lungs (to pick up oxygen and lose CO₂) → left side of heart. Circuit 2 (systemic): left side of heart → body organs → right side of heart. Advantage: oxygenated and deoxygenated blood are kept completely separate, preventing mixing. The left side can pump blood at higher pressure to the body, ensuring efficient oxygen delivery to all tissues. This is more efficient than a single circulatory system.',
        },
    ],
    ('0610', 'Ecology and Environment'): [
        {
            'question_text': 'Explain what is meant by a food chain and construct one with four trophic levels using organisms from a woodland ecosystem. [3]',
            'marks': 3,
            'difficulty': 'easy',
            'years_appeared': [2017, 2018, 2019, 2021, 2022],
            'hint_stages': [
                'A food chain shows the flow of energy from one organism to the next. It always starts with a producer (plant).',
                'Example: Oak tree → caterpillar → blue tit → sparrowhawk. Each arrow means "is eaten by".',
            ],
            'answer': 'A food chain shows the transfer of energy from one organism to the next through feeding relationships. It always begins with a producer (a plant that makes its own food via photosynthesis). Example woodland food chain with four trophic levels: Oak tree (producer) → Caterpillar (primary consumer/herbivore) → Blue tit (secondary consumer/carnivore) → Sparrowhawk (tertiary consumer/carnivore). Each arrow means "is eaten by" and represents energy transfer.',
        },
        {
            'question_text': 'Describe the carbon cycle, including the processes that add carbon dioxide to the atmosphere and those that remove it. [6]',
            'marks': 6,
            'difficulty': 'hard',
            'years_appeared': [2018, 2020, 2022, 2023],
            'hint_stages': [
                'Processes that ADD CO₂: respiration (all organisms), combustion (burning fossil fuels/wood), decomposition.',
                'Processes that REMOVE CO₂: photosynthesis (plants, algae). CO₂ is also absorbed into oceans.',
                'Link them into a cycle: plants absorb CO₂ → animals eat plants → animals respire → CO₂ returned to air.',
            ],
            'answer': 'Processes that ADD CO₂ to the atmosphere: (1) Respiration — all living organisms release CO₂ as they break down glucose for energy; (2) Combustion — burning fossil fuels and wood releases stored carbon as CO₂; (3) Decomposition — microorganisms break down dead organisms, releasing CO₂. Processes that REMOVE CO₂: (1) Photosynthesis — green plants and algae absorb CO₂ to make glucose; (2) Dissolution into oceans — CO₂ dissolves in seawater and may form carbonate sediments. The cycle: atmospheric CO₂ → absorbed by plants via photosynthesis → eaten by animals → released back through respiration, decomposition, or combustion.',
        },
        {
            'question_text': 'Explain how the overuse of fertilisers can lead to eutrophication in a nearby lake. [5]',
            'marks': 5,
            'difficulty': 'hard',
            'years_appeared': [2019, 2021, 2022, 2023, 2024],
            'hint_stages': [
                'Fertilisers contain nitrates and phosphates. What happens when rain washes them into the lake?',
                'Nitrates/phosphates cause rapid growth of algae (algal bloom), which blocks sunlight from reaching underwater plants.',
                'Plants below die → decomposers break them down → decomposers use up oxygen → fish and other animals suffocate.',
            ],
            'answer': 'Excess fertilisers (containing nitrates and phosphates) are washed by rain from fields into nearby lakes — this is called leaching. The high nutrient levels cause rapid, excessive growth of algae on the water surface (algal bloom). The algal bloom blocks sunlight from reaching aquatic plants below, which then die. Decomposing bacteria break down the dead plants and algae, multiplying rapidly and using up the dissolved oxygen in the water. The drop in oxygen levels (deoxygenation) causes fish and other aquatic animals to suffocate and die. This whole process is called eutrophication.',
        },
    ],
}

STUDENTS = [
    {'name': 'Demo Student 1', 'email': 'demo1@tutorly.com'},
    {'name': 'Demo Student 2', 'email': 'demo2@tutorly.com'},
    {'name': 'Demo Student 3', 'email': 'demo3@tutorly.com'},
]


# ---------------------------------------------------------------------------
# Insertion logic
# ---------------------------------------------------------------------------

def seed():
    conn = get_db()
    try:
        with conn.cursor() as cur:
            # Subjects
            subject_ids = {}
            for s in SUBJECTS:
                cur.execute(
                    '''INSERT INTO subjects (name, code, icon)
                       VALUES (%s, %s, %s)
                       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon
                       RETURNING id''',
                    (s['name'], s['code'], s['icon'])
                )
                subject_ids[s['code']] = cur.fetchone()['id']
            print(f'  Subjects: {len(subject_ids)} upserted')

            # Topics
            topic_ids = {}  # (subject_code, topic_name) -> id
            for code, topic_names in TOPICS.items():
                sid = subject_ids[code]
                for tname in topic_names:
                    cur.execute(
                        '''INSERT INTO topics (subject_id, name)
                           VALUES (%s, %s)
                           ON CONFLICT DO NOTHING''',
                        (sid, tname)
                    )
                    cur.execute(
                        'SELECT id FROM topics WHERE subject_id = %s AND name = %s',
                        (sid, tname)
                    )
                    topic_ids[(code, tname)] = cur.fetchone()['id']
            print(f'  Topics: {len(topic_ids)} ensured')

            # Questions
            q_count = 0
            for (code, tname), questions in QUESTIONS.items():
                tid = topic_ids[(code, tname)]
                for q in questions:
                    cur.execute(
                        '''INSERT INTO questions
                               (topic_id, question_text, passage, marks, difficulty,
                                years_appeared, hint_stages, answer)
                           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                           ON CONFLICT DO NOTHING''',
                        (
                            tid,
                            q['question_text'],
                            q.get('passage'),
                            q['marks'],
                            q['difficulty'],
                            q['years_appeared'],
                            json.dumps(q['hint_stages']),
                            q.get('answer'),
                        )
                    )
                    q_count += 1
            print(f'  Questions: {q_count} processed')

            # Students
            for st in STUDENTS:
                cur.execute(
                    '''INSERT INTO students (name, email)
                       VALUES (%s, %s)
                       ON CONFLICT (email) DO NOTHING''',
                    (st['name'], st['email'])
                )
            print(f'  Students: {len(STUDENTS)} ensured')

        conn.commit()
        print('Seed complete.')
    finally:
        conn.close()


if __name__ == '__main__':
    print('Seeding database...')
    seed()
