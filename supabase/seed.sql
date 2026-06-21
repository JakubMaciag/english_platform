-- =============================================
-- Seed data - run AFTER 001_initial_schema.sql
-- =============================================

-- ---- DICTIONARY ENTRIES ----

-- Polish to English (pl-en)
INSERT INTO public.dictionary_entries (word, translation, dict_type, description, example_sentence, level) VALUES
('niejednoznaczny', 'ambiguous', 'pl-en', 'having more than one possible meaning', 'The politician''s statement was deliberately ambiguous.', 'C1'),
('wszechobecny', 'ubiquitous', 'pl-en', 'present, appearing, or found everywhere', 'Smartphones have become ubiquitous in modern society.', 'C2'),
('ulotny', 'ephemeral', 'pl-en', 'lasting for a very short time', 'Fame can be ephemeral.', 'C2'),
('wymowny', 'eloquent', 'pl-en', 'fluent and persuasive in speech or writing', 'She gave an eloquent speech at the ceremony.', 'C1'),
('nieuchronny', 'inevitable', 'pl-en', 'certain to happen; unavoidable', 'Change is inevitable.', 'B2'),
('dobroczynny', 'benevolent', 'pl-en', 'well-meaning and kindly', 'The benevolent king was loved by his subjects.', 'C1'),
('bezprecedensowy', 'unprecedented', 'pl-en', 'never done or known before', 'The crisis required unprecedented measures.', 'C1'),
('drobiazgowy', 'meticulous', 'pl-en', 'showing great attention to detail', 'She was meticulous in her research.', 'C1'),
('enigmatyczny', 'enigmatic', 'pl-en', 'difficult to interpret or understand', 'The Mona Lisa has an enigmatic smile.', 'C2'),
('skrupulatny', 'scrupulous', 'pl-en', 'diligent and careful; having moral integrity', 'He was scrupulous about his expenses.', 'C2'),
('wyrafinowany', 'sophisticated', 'pl-en', 'having refined knowledge of the world', 'She had a sophisticated sense of style.', 'B2'),
('narastajacy', 'escalating', 'pl-en', 'becoming more serious or intense', 'The escalating tensions led to conflict.', 'B2'),
('sformulowac', 'articulate', 'pl-en', 'to express an idea clearly and effectively', 'He could articulate his concerns very well.', 'C1'),
('odstraszyc', 'deter', 'pl-en', 'to discourage from doing something', 'The alarm was meant to deter burglars.', 'B2'),
('pochlaniajacy', 'engross', 'pl-en', 'to absorb all the attention of', 'She was completely engrossed in her book.', 'C1');

-- English to Polish (en-pl)
INSERT INTO public.dictionary_entries (word, translation, dict_type, description, example_sentence, level) VALUES
('perseverance', 'wytrwalosc', 'en-pl', 'continued effort despite difficulty', 'Her perseverance finally paid off after years of hard work.', 'B2'),
('scrutiny', 'drobiazgowa analiza', 'en-pl', 'critical observation or examination', 'The accounts were under financial scrutiny.', 'C1'),
('ambivalence', 'ambiwalencja', 'en-pl', 'mixed feelings or contradictory ideas about something', 'He felt ambivalence about leaving his job.', 'C2'),
('pragmatic', 'pragmatyczny', 'en-pl', 'dealing with things sensibly and realistically', 'We need a pragmatic approach to solving this.', 'B2'),
('plausible', 'wiarygodny', 'en-pl', 'seeming reasonable or probable', 'The explanation seemed plausible at first.', 'B2'),
('nuanced', 'niuansowy', 'en-pl', 'characterized by subtle shades of meaning', 'Her analysis was nuanced and well-argued.', 'C1'),
('imperative', 'niezbedny / pilny', 'en-pl', 'of vital importance; essential', 'It is imperative that we act immediately.', 'C1'),
('disparity', 'dysproporcja', 'en-pl', 'a great difference between things', 'There is a growing disparity in wealth.', 'C1'),
('coherent', 'spojny', 'en-pl', 'logical and consistent', 'She presented a coherent argument.', 'B2'),
('discrepancy', 'rozbieznosc', 'en-pl', 'a lack of compatibility or similarity', 'There was a discrepancy in the accounts.', 'C1'),
('mitigate', 'lagodzic', 'en-pl', 'to make less severe, serious, or painful', 'Measures were taken to mitigate the impact.', 'C1'),
('complacency', 'samozadowolenie', 'en-pl', 'smug self-satisfaction; lack of concern', 'We cannot afford complacency in this situation.', 'C2'),
('paradigm', 'paradygmat', 'en-pl', 'a typical example or pattern of something', 'This discovery represents a paradigm shift.', 'C2'),
('tentative', 'niepewny / wstepny', 'en-pl', 'not certain or fixed; done without confidence', 'We made a tentative agreement.', 'C1'),
('alleviate', 'lagodzic / zmniejszac', 'en-pl', 'to make suffering less severe', 'The medication helps alleviate pain.', 'C1');

-- English to English descriptive (en-en)
INSERT INTO public.dictionary_entries (word, translation, dict_type, description, example_sentence, level) VALUES
('serendipity', 'the occurrence of fortunate events by chance', 'en-en', 'The quality of finding something good without looking for it; happy accidents', 'It was pure serendipity that they met at the airport.', 'C2'),
('conundrum', 'a confusing and difficult problem or question', 'en-en', 'A riddle whose answer involves a pun; a puzzling question', 'How to fund the project was a real conundrum.', 'C1'),
('eloquence', 'fluent and persuasive speaking or writing', 'en-en', 'The art of using language expressively and meaningfully', 'The lawyer was known for her eloquence in court.', 'C1'),
('resilience', 'the capacity to recover quickly from difficulties', 'en-en', 'The ability to spring back into shape after adversity', 'Children often show remarkable resilience after trauma.', 'B2'),
('tenacity', 'the quality of being determined and persistent', 'en-en', 'Stubborn persistence; firm grip on a goal or belief', 'His tenacity in the face of failure eventually led to success.', 'C1'),
('perplexity', 'a state of being bewildered or puzzled', 'en-en', 'Confusion or uncertainty about something', 'She stared at the instructions in perplexity.', 'C1'),
('integrity', 'the quality of being honest and having strong principles', 'en-en', 'Moral uprightness and wholeness of character', 'Her integrity was never in doubt throughout her career.', 'B2'),
('lucid', 'expressed clearly; easy to understand', 'en-en', 'Having a clear, logical, and easy-to-understand quality', 'He gave a lucid explanation of the complex topic.', 'B2'),
('verbose', 'using more words than necessary', 'en-en', 'Using an excess of words; wordy; long-winded', 'His verbose report could have been summarised in a page.', 'C1'),
('catalyst', 'something that causes or accelerates a reaction or change', 'en-en', 'A person or thing that precipitates an event', 'The speech acted as a catalyst for the protest movement.', 'C1');


-- ---- EXERCISES ----
-- Each exercise is a separate INSERT to avoid multiline string parsing issues.

-- 1. Second Conditional (grammar, B2, multiple_choice)
INSERT INTO public.exercises (title, description, category, level, exercise_type, data, order_index) VALUES ('Second Conditional', 'Practice forming sentences about unreal present situations.', 'grammar', 'B2', 'multiple_choice', '{"question":"Choose the correct form to complete the second conditional sentence:","context":"If I ___ a million pounds, I would travel the world.","options":["have","had","would have","will have"],"correct_index":1,"explanation":"In the second conditional we use the past simple in the if-clause to talk about an unreal or unlikely present/future situation."}', 1);

-- 2. Passive Voice Past Simple (grammar, B2, fill_blank)
INSERT INTO public.exercises (title, description, category, level, exercise_type, data, order_index) VALUES ('Passive Voice - Past Simple', 'Practise transforming active sentences to passive.', 'grammar', 'B2', 'fill_blank', '{"question":"Complete the sentence using the passive voice:","sentence":"The report ___ (write) by the manager last Friday.","correct_answers":["was written"],"hint":"Past simple passive = was/were + past participle","explanation":"Past simple passive uses was/were + past participle. The subject is singular so we use was written."}', 2);

-- 3. Relative Clauses (grammar, B2, multiple_choice)
INSERT INTO public.exercises (title, description, category, level, exercise_type, data, order_index) VALUES ('Relative Clauses', 'Choose the correct relative pronoun.', 'grammar', 'B2', 'multiple_choice', '{"question":"Which sentence uses the relative pronoun correctly?","context":null,"options":["The woman which I spoke to was very helpful.","The woman who I spoke to was very helpful.","The woman whom spoke to me was very helpful.","The woman that spoke was very helpful me."],"correct_index":1,"explanation":"Who is used for people as the subject or object in a relative clause. Which is used for things. Who I spoke to is the most natural choice in modern English."}', 3);

-- 4. Third Conditional (grammar, C1, multiple_choice)
INSERT INTO public.exercises (title, description, category, level, exercise_type, data, order_index) VALUES ('Third Conditional', 'Practice the third conditional for unreal past situations.', 'grammar', 'C1', 'multiple_choice', '{"question":"Select the correct third conditional form:","context":"If she ___ harder, she would have passed the exam.","options":["studied","had studied","would study","has studied"],"correct_index":1,"explanation":"The third conditional uses had + past participle in the if-clause and would have + past participle in the main clause. It refers to an unreal past situation."}', 4);

-- 5. Inversion for Emphasis (grammar, C1, fill_blank)
INSERT INTO public.exercises (title, description, category, level, exercise_type, data, order_index) VALUES ('Inversion for Emphasis', 'Practise formal inversion structures.', 'grammar', 'C1', 'fill_blank', '{"question":"Complete the inversion structure:","sentence":"I had no sooner sat down ___ the phone rang.","correct_answers":["than"],"hint":"No sooner ... than is a fixed inversion pattern.","explanation":"No sooner...than is a formal inversion structure. The word than completes the comparative pattern."}', 5);

-- 6. Mixed Conditionals (grammar, C1, multiple_choice)
INSERT INTO public.exercises (title, description, category, level, exercise_type, data, order_index) VALUES ('Mixed Conditionals', 'Combine past and present conditions.', 'grammar', 'C1', 'multiple_choice', '{"question":"Which sentence is a correct mixed conditional?","context":null,"options":["If I had taken the job, I would be living in Paris now.","If I took the job, I would have lived in Paris.","If I had taken the job, I would have been in Paris.","If I take the job, I will live in Paris now."],"correct_index":0,"explanation":"A mixed conditional combines a third conditional if-clause (unreal past) with a second conditional main clause (unreal present result)."}', 6);

-- 7. Cleft Sentences (grammar, C2, multiple_choice)
INSERT INTO public.exercises (title, description, category, level, exercise_type, data, order_index) VALUES ('Cleft Sentences', 'Practise cleft structures for emphasis.', 'grammar', 'C2', 'multiple_choice', '{"question":"Which cleft sentence correctly emphasises the subject?","context":"SHE told him the truth (not someone else).","options":["It was she who told him the truth.","It was her who told him the truth.","What she told him was the truth.","She was the one that told him the truth was."],"correct_index":0,"explanation":"It was + noun/pronoun + who/that is the standard cleft structure for emphasising the subject. Use the subject pronoun after be in formal English."}', 7);

-- 8. Subjunctive Mood (grammar, C2, fill_blank)
INSERT INTO public.exercises (title, description, category, level, exercise_type, data, order_index) VALUES ('Subjunctive Mood', 'Practise formal subjunctive structures.', 'grammar', 'C2', 'fill_blank', '{"question":"Complete the formal sentence using the subjunctive:","sentence":"The committee recommends that each candidate ___ (submit) their portfolio by Friday.","correct_answers":["submit"],"hint":"Mandative subjunctive: recommend/suggest/insist + that + base form (no -s).","explanation":"The mandative subjunctive uses the base form of the verb regardless of the subject. Each candidate submits becomes that each candidate submit after verbs of recommendation."}', 8);

-- 9. Phrasal Verbs Match (vocabulary, B2, matching)
INSERT INTO public.exercises (title, description, category, level, exercise_type, data, order_index) VALUES ('Phrasal Verbs - Match', 'Match each phrasal verb with its meaning.', 'vocabulary', 'B2', 'matching', '{"instruction":"Match each phrasal verb with its correct meaning:","pairs":[{"left":"put off","right":"to postpone or delay"},{"left":"carry out","right":"to perform or complete a task"},{"left":"bring up","right":"to mention a topic"},{"left":"get over","right":"to recover from something"},{"left":"look into","right":"to investigate or examine"}]}', 9);

-- 10. Word Formation Adjectives (vocabulary, B2, fill_blank)
INSERT INTO public.exercises (title, description, category, level, exercise_type, data, order_index) VALUES ('Word Formation - Adjectives', 'Form adjectives from the given nouns or verbs.', 'vocabulary', 'B2', 'fill_blank', '{"question":"Transform the word in brackets into the correct adjective:","sentence":"The instructions were so ___ (ambiguity) that nobody knew what to do.","correct_answers":["ambiguous"],"hint":"The noun ambiguity becomes an adjective ending in -ous.","explanation":"The adjective form of ambiguity is ambiguous. Many nouns ending in -ity have adjective forms ending in -ous."}', 10);

-- 11. Academic Collocations (vocabulary, C1, multiple_choice)
INSERT INTO public.exercises (title, description, category, level, exercise_type, data, order_index) VALUES ('Academic Collocations', 'Choose the correct verb that collocates with the noun.', 'vocabulary', 'C1', 'multiple_choice', '{"question":"Choose the correct collocation:","context":"The researchers ___ a study on the effects of social media on teenagers.","options":["made","did","conducted","performed"],"correct_index":2,"explanation":"In academic English, conduct is the standard verb that collocates with a study, research, an experiment, and an investigation. Conduct a study is the most formal option."}', 11);

-- 12. Academic Vocabulary Match (vocabulary, C1, matching)
INSERT INTO public.exercises (title, description, category, level, exercise_type, data, order_index) VALUES ('Academic Vocabulary - Match', 'Match each academic word with its definition.', 'vocabulary', 'C1', 'matching', '{"instruction":"Match each academic word with its correct definition:","pairs":[{"left":"substantiate","right":"to provide evidence to support a claim"},{"left":"infer","right":"to conclude from evidence and reasoning"},{"left":"corroborate","right":"to confirm or support with evidence"},{"left":"refute","right":"to prove a statement or theory wrong"},{"left":"elucidate","right":"to make something clear; to explain"}]}', 12);

-- 13. Formal vs Informal Register (vocabulary, C1, multiple_choice)
INSERT INTO public.exercises (title, description, category, level, exercise_type, data, order_index) VALUES ('Formal vs Informal Register', 'Choose the formal equivalent of the informal expression.', 'vocabulary', 'C1', 'multiple_choice', '{"question":"Which option is the most appropriate formal equivalent of: We need to look into this problem.","context":null,"options":["We need to check out this problem.","This problem requires investigation.","We should poke around this issue.","We must have a look at this trouble."],"correct_index":1,"explanation":"In formal writing, phrasal verbs and informal expressions are replaced with single-word formal verbs. Look into becomes investigate. Option B is the most concise and formal."}', 13);

-- 14. Idiomatic Expressions (vocabulary, C2, multiple_choice)
INSERT INTO public.exercises (title, description, category, level, exercise_type, data, order_index) VALUES ('Idiomatic Expressions', 'Choose the correct interpretation of the idiom.', 'vocabulary', 'C2', 'multiple_choice', '{"question":"What does the idiom to burn one''s bridges mean?","context":"By resigning without notice, he burned his bridges with the company.","options":["To cause a fire accidentally","To permanently cut off a relationship or opportunity","To work very hard without rest","To destroy physical infrastructure"],"correct_index":1,"explanation":"To burn one''s bridges means to take an action that makes it impossible to return to a previous situation or repair a relationship. It comes from the military tactic of burning bridges to prevent retreat."}', 14);

-- 15. Translation Polish to English (vocabulary, C2, translation)
INSERT INTO public.exercises (title, description, category, level, exercise_type, data, order_index) VALUES ('Translation - Polish to English', 'Translate the sentence accurately into English.', 'vocabulary', 'C2', 'translation', '{"instruction":"Translate the following sentence into English:","source_text":"Gdyby byl sie bardziej postaral, zdalby egzamin.","source_language":"Polish","target_language":"English","correct_answers":["If he had tried harder, he would have passed the exam."],"accepted_variants":["Had he tried harder, he would have passed the exam.","If he had made more effort, he would have passed the exam."],"explanation":"This sentence uses the third conditional - an unreal past situation. The Polish Gdyby byl signals the past perfect in the if-clause and zdalby signals the conditional perfect in the main clause."}', 15);
