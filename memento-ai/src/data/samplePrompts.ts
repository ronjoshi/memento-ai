export interface SamplePrompt {
	label: string;
	fullPrompt: string;
}

export const SAMPLE_PROMPTS: SamplePrompt[] = [
	{
		label: "Analyze patterns of anxiety around work visibility",
		fullPrompt:
			"Pull up every entry where I mention feeling anxious about work visibility (meetings, 'be more visible,' performance review). Then help me find the pattern and give me a few experiments to try.",
	},
	{
		label: "Review triggers and coping patterns from panic at work",
		fullPrompt:
			"Find the entry where I had a near panic attack at work and hid in the bathroom stall. What triggered it, what helped, and what should I do next time?",
	},
	{
		label: "Process emotional patterns after performance review feedback",
		fullPrompt:
			"When was the performance review where I got 'could be more visible'? Walk me through how I reacted that night, and help me process the fear underneath it.",
	},
	{
		label: "Explore patterns in how I receive compliments",
		fullPrompt:
			"Find the entries where I got compliments (outfit compliment, coworker compliment, cashier compliment, barista doodles). Why do compliments hit me so hard, and how can I learn to receive them without shrinking?",
	},
	{
		label: "Examine thought patterns behind feeling forgettable",
		fullPrompt:
			"Find the day the barista spelled my name wrong and I took it as proof I'm forgettable. Help me talk through why my brain does that.",
	},
	{
		label: "Summarize recurring lessons about rest and worth",
		fullPrompt:
			"Find every time I wrote about rest not being something I have to earn. Summarize the lessons I keep repeating.",
	},
	{
		label: "Clarify fear patterns in friendship conflict",
		fullPrompt:
			"I want to talk through the friendship fracture. Help me figure out what I'm afraid will happen if I say 'that hurt,' and help me draft a message that feels honest and not self-erasing.",
	},
	{
		label: "Identify auditioning patterns in ambiguous romance",
		fullPrompt:
			"Find all entries where the almost-romance got ambiguous/inconsistent and I started performing (being chill, low-maintenance, overanalyzing tone). Help me notice the 'auditioning' pattern and set a standard.",
	},
	{
		label: "Analyze body-first stress response patterns",
		fullPrompt:
			"Show me entries where I mention tight chest, clenched jaw, shoulders up near my ears, bracing for impact, or my body reacting first. What situations show up most?",
	},
	{
		label: "Collect tiny joy moments for emotional grounding",
		fullPrompt:
			"Pull 10 'tiny joy' moments from my journals (dogs in sweaters, star on cup lid, cookie, bookstore, silly soda, chalk message, dinosaur balloon, tree route). Put them in a list I can revisit when I'm spiraling.",
	},
	{
		label: "Track mood changes with food, rest, and training",
		fullPrompt:
			"What changes in my mood when I eat well, rest, or train consistently?",
	},
	{
		label: "Analyze patterns in self-talk and self-worth",
		fullPrompt:
			"I want to know what I've been thinking of myself, and what changes I can make to my internal self-talk to boost my self worth.",
	},
];
