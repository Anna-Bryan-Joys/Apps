import { useState, useEffect, useRef } from "react";
import SunCalc from "suncalc";

const SUIT_SYMBOLS = { d: "♦", h: "♥", c: "♣", s: "♠" };
const NIGHT_COLORS = { d: "#F4C842", h: "#E8556A", c: "#5DBE8A", s: "#7EB3E8" };
const DAY_COLORS   = { d: "#B07000", h: "#C03040", c: "#1A7040", s: "#1A509A" };

function getSunTimes(coords) {
  if (!coords) return null;
  const now = new Date();
  return SunCalc.getTimes(now, coords.lat, coords.lon);
}

function isDaytime(coords) {
  const now = new Date();
  const sun = getSunTimes(coords);
  if (sun) return now >= sun.sunrise && now < sun.sunset;
  const h = now.getHours();
  return h >= 6 && h < 19;
}

function getGreeting(coords) {
  const now = new Date();
  const h = now.getHours();
  const sun = getSunTimes(coords);
  const sunsetHour = sun ? sun.sunset.getHours() + sun.sunset.getMinutes() / 60 : 19;
  const sunriseHour = sun ? sun.sunrise.getHours() + sun.sunrise.getMinutes() / 60 : 6;
  if (h + now.getMinutes() / 60 >= sunriseHour && h < 12) return "Good Morning";
  if (h >= 12 && h + now.getMinutes() / 60 < sunsetHour) return "Good Afternoon";
  if (h + now.getMinutes() / 60 >= sunsetHour && h < 21) return "Good Evening";
  return "Good Night";
}

function loadCoords() {
  try { return JSON.parse(localStorage.getItem('lc_coords')); } catch { return null; }
}

function parseCard(str, day) {
  if (!str) return null;
  const suit = str.slice(-1), value = str.slice(0, -1);
  return { value, suit, symbol: SUIT_SYMBOLS[suit], color: (day ? DAY_COLORS : NIGHT_COLORS)[suit] };
}

const READINGS = {
  "10c": {
    title: "10 of Clubs",
    subtitle: "Healer Code",
    body: `If you are a Ten of Clubs, you are designed to see from the highest vantage point. You do not simply gather information — you synthesize it. You can look at complexity and extract the core truth. You can observe details and organize them into something meaningful. Where others see fragments, you see patterns. Where others feel overwhelmed, you instinctively search for the higher perspective.

This gives you a kind of quiet authority. You are capable of attracting success in many forms because you understand how systems work. You can build strong family foundations. You can cultivate meaningful partnerships. You can lead organizations or communities with a natural sense of structure. There is something about your presence that stabilizes vision and gives it direction.

And yet, one of your deeper shadows is self-doubt. You may see clearly — but question your own seeing. You may hear the truth — but wonder if you imagined it. You can put the power in others simply because they seem more certain. Meanwhile, your own perception remains under-claimed.

The Ten of Clubs is here to own what it sees. When you trust your perspective, your leadership becomes steady. When you doubt it, your mind begins to spiral through options, possibilities, and hypothetical outcomes. The very brilliance that allows you to rise above complexity can become trapped in analysis. You are not here to overthink your vision. You are here to embody it.`
  },
  "10d": {
    title: "10 of Diamonds",
    subtitle: "Healer Code",
    body: `If you are a Ten of Diamonds, you carry an energy the world tends to recognize. People often feel your momentum before they understand your heart. There is a natural prosperity current in you—an ability to align with what you need, and often a little more than you expected. It can look like luck from the outside, but it rarely feels like "luck" from the inside. It feels like drive. It feels like appetite. It feels like a deep relationship with the physical world and a willingness to participate fully in it.

You are often someone who loves being alive in a body. Not in a superficial way, but in a devotional way. You love experiences that remind you life is real—movement, travel, new places, the sensory beauty of this world. You might be the kind of person who can feel nourished by a sunset, a long drive, the ocean, the simple pleasure of being present with something beautiful. Your spirit learns through experience, and you tend to feel most inspired when life is allowed to be rich, varied, and spacious.

You still have your own inner tension. Because the Ten of Diamonds can feel an invisible expectation to keep delivering. When things come easily, the world can start to assume they always will. And you may start to assume that too. The pressure becomes subtle: Keep it going. Keep it rising. Keep it moving forward. Even when you're grateful, you can feel the weight of needing to maintain the momentum—especially if you've become the person others rely on for results, resources, or stability.

Your deeper initiation is not just to be prosperous. It is to learn how to enjoy prosperity without making it a performance. To let abundance be something you receive, not something you must constantly recreate to prove you're worthy of it.`
  },
  "10h": {
    title: "10 of Hearts",
    subtitle: "Healer Code",
    body: `To be the Ten of Hearts is to carry the blueprint of the world you wish existed. You don’t simply hope for peace—you believe it is the natural operating system of reality. You value love as a structure, not a sentiment. You believe community should feel nourishing. You believe connection should feel safe. You believe fulfillment should be possible, not rare. And somewhere inside you, there is a quiet knowing that humanity is capable of more tenderness than it currently expresses. This makes you idealistic—but not in a naïve way. It makes you visionary. You can see what is possible when love becomes the foundation rather than the afterthought. And because you can see it, you feel called to embody it.

Yet here is the tension you live with. The world around you often measures importance through financial success, material output, or visible achievement. And while you deeply value peace, love, and emotional fulfillment, you are not immune to the pull of prosperity. You want stability. You want comfort. You want your physical needs met without constant strain. But you may quietly feel guilty for that desire—as though wanting financial abundance somehow contradicts your devotion to love.

So you stand in the middle of two currents. One says, Peace is everything. The other says, Security matters too. And if you have overgiven, overworked, or overextended yourself in the name of being loving, you may feel unappreciated. You show up. You build. You serve. You give. And instead of gratitude, you’re often met with expectation. Instead of “thank you,” you’re handed more responsibility.

This can be a frustrating chart to inhabit early in life. You may feel like you are holding a vision that others do not value in the same way you do. You may feel misunderstood in your depth of care. You may feel like you are always giving more than you receive.

But you are not here to abandon your vision. You are here to refine how you live it.`
  },
  "2c": {
    title: "2 of Clubs",
    subtitle: "Healer Code",
    body: `If you are a Two of Clubs, you were born with a mind that understands consequence. This is not a light, carefree mental energy. This is the mind that sees both sides, anticipates outcomes, tracks ripple effects, and quietly asks, “If I choose this… what might it cost?” Of all the Twos, yours carries one of the deepest senses of responsibility. You are not naïve about choice. You understand that every decision shapes a path, and every path closes another. Because of this, you may have grown up feeling the weight of decision long before others did. You might have hesitated when others leapt. You might have overthought when others acted impulsively. Not because you are incapable—but because you are aware. You see endings inside beginnings. You feel the echo of consequence before the action is even taken.

At times, this awareness can slow you down. You may find yourself circling decisions, analyzing outcomes, imagining what could go wrong. The mind becomes protective. It says, “If I can predict every ripple, I can prevent pain.” And yet, the paradox of your chart is this: overthinking does not eliminate risk. It simply delays movement.

As a healer, coach, or leader, this can be both your brilliance and your burden. You are thoughtful. You do not move recklessly. You consider impact. You understand that your voice carries weight. But if fear of consequence becomes louder than desire, you can begin to live cautiously instead of courageously.

Your path is not about eliminating doubt. It is about choosing in spite of it. The Two of Clubs is here to unlock decisive devotion. To teach you that what you want—truly want—is worth the discomfort of uncertainty. To help you fall in love with your purpose so deeply that the fear of what might happen becomes smaller than the call of what wants to happen. You are not here to avoid consequence. You are here to choose consciously—and move forward anyway.`
  },
  "2d": {
    title: "2 of Diamonds",
    subtitle: "Healer Code",
    body: `If you are a 2 of Diamonds, you are wired for connection in the physical world—partnership, collaboration, shared vision, mutual gain. You're not someone who only wants to "do your thing" alone. You want to build with people. You love the strategy of a deal, the choreography of an exchange, the moment when two energies meet and something becomes possible that could not have happened in isolation. You often have a natural gift for coordination—seeing where the pieces fit, sensing what someone needs, knowing how to bring the right people to the right table at the right time.

And because this is Diamonds, your relationship to partnership isn't purely emotional—it is also practical. You tend to understand value. You can sense what an agreement is really asking for beneath the words. You notice the details. You see how something will be perceived in the world—how it will "land," how it will look, how it will be received. At your best, this makes you skillful and precise. But when you're under stress, it can pull you into a life where perception becomes more important than truth, and the outer shape of success becomes more important than what your heart actually wants.

This is where your deeper lesson begins. The 2 of Diamonds often carries a very real hunger for love and prosperity, and part of your journey is learning that you don't have to betray one to have the other. You may hesitate to commit because you feel how serious commitment is. If you give your word, you tend to mean it. You don't want to be careless with your bonds—because partnership, to you, is sacred on the physical plane. And so you may hold back, watching, testing, waiting until you're certain. The tenderness here is that your heart is deeper than you let on, and trust is not something you give lightly.`
  },
  "2h": {
    title: "2 of Hearts",
    subtitle: "Healer Code",
    body: `To be the Two of Hearts is to be born with an instinct to join. Where the Ace of Hearts can feel like love rising from within the self, the Two of Hearts feels like love reaching outward, searching for the place it belongs. You are not here to live life at arm’s length. You are wired for closeness, for partnership, for the sacred friction and tenderness of relationship—because through relationship, you discover who you are. And under that longing to connect, there is an even deeper longing: to be seen. 

Not admired. Not “appreciated.” Seen. Understood. Valued for who you actually are. 

The paradox is that the Two of Hearts often becomes an expert at seeing everyone else. You notice what people need. You remember what matters to them. You feel the subtle emotional weather in the room and instinctively try to make it gentler, safer, more harmonious. Over time, if you’re not careful, you can become indispensable—and invisible at the very same time. 

This is why the Two of Hearts can carry a quiet loneliness, even in a full life. People know how they feel when they’re with you… but they may not know you. And you may have learned early—through loss, disappointment, or the simple experience of being “the dependable one”—that it’s easier to care for others than to risk being fully met. 

Yet the truth of your card is not self-erasure. It’s sacred reciprocity. Your heart is not designed to be the supportive background music of everyone else’s story. It is meant to be heard, honored, and held. As a healer, coach, or leader, this makes you profoundly relational. You don’t just understand transformation—you sense it through the nervous system of connection. You can help others feel safe enough to open. But your mastery begins when you stop measuring love by how well you care for everyone, and begin recognizing that your needs are not an inconvenience. 

They are part of the design.`
  },
  "3c": {
    title: "3 of Clubs",
    subtitle: "Healer Code",
    body: `If you are a Three of Clubs, you carry a mind that does not merely think — it constructs. You see patterns where others see noise. You sense structure inside chaos. Complex systems do not intimidate you; they intrigue you. There is something in you that delights in refinement — in taking what feels scattered and shaping it into something coherent, usable, and elegant. You are a natural architect of ideas. Not just creative, but constructive. You can receive a flood of information and distill it into something digestible. You can translate abstraction into process. You can write, speak, build, or design in a way that helps others finally understand what once felt overwhelming. This is not accidental. This is the signature of your chart.

And yet, with this brilliance comes pressure. Because you do not just want to create. You want to get it right. You want the right answer. The most elegant solution. The refined expression. There is a quiet intensity in you that says, “If I am going to do this, it must be done well.” Over time, that intensity can turn into weight.

You may begin to equate your value with what you produce. With how well you solve problems or with how efficiently you respond. People sense your capability. They rely on you. They invite you into projects. They expect clarity from you. And because you can deliver, you often do.

But if you are not careful, you begin creating not for the joy of it — but for the affirmation of it. For the reassurance that you are valuable.

Here is the deeper truth of your chart: it is the act of creation itself that fulfills you. Not the applause. Not the outcome. Not even the usefulness. The process. You are here to create because creating stabilizes your spirit. When you build for the love of building, when you refine because it delights you, when you write or design or teach because it feels alive in your body — that is when you are most aligned.`
  },
  "3d": {
    title: "3 of Diamonds",
    subtitle: "Healer Code",
    body: `If you are a 3 of Diamonds, you are someone who knows—deep down—how short life is. Not as a concept. As a lived awareness that has brushed up against loss, impermanence, endings, and change enough times that your body remembers it. This awareness can make you feel urgent in ways you don't always explain to others. It can make you feel like you're racing the clock, even when you're smiling. It can make you hungry for experience, not because you're reckless, but because you can feel how precious the window is.

This is why so many Three of Diamonds feel the tension between two instincts that seem to contradict each other. One instinct says: Protect yourself. Be careful. Watch what could go wrong. The other says: Be free. Don't limit yourself. Don't waste the chance. When this becomes intense, decision-making can feel like a trap. Commitment can feel confining. Even simple choices can feel heavy, because each choice seems to close a door—and your nervous system doesn't want any door to close.

And yet, the gift inside this pattern is immense. As a Diamond, your self-expression tends to be physical, tangible, sensory, embodied. You are meant to create in ways people can feel. Your creativity isn't only intellectual—it's lived, played, touched, danced, moved through. You may be drawn to nature, water, movement, travel, tactile art, beauty, or any form of creation that lets you be fully here in this earthly plane. You don't just want to think about life. You want to taste it.

But because you are so alive to how quickly things can change, you may also notice fear moving beneath your hunger. Sometimes the impulse to "get everything out of life" is carrying an unspoken terror: What if I lose the chance? What if I don't get to do what I came here to do? What if people leave? What if I'm left behind? And this is where your path deepens—because the Three of Diamonds is not only here to live fully. You are here to live fully without needing urgency to be your fuel.`
  },
  "3h": {
    title: "3 of Hearts",
    subtitle: "Healer Code",
    body: `To be the Three of Hearts is to carry a heart that is alive—curious, expressive, socially radiant, and hungry for connection in motion. You are not here to love quietly in the corner. You are here to share love. To demonstrate it. To animate it. To walk into a space and make it more human, more playful, more bright—often without even trying. 

There is a natural magnetism to this card, as if your presence invites people to loosen their grip and remember that life is meant to be experienced, not merely managed. And because you are wired to connect widely, you often want to meet everyone in the room, not just one person. Your heart learns through variety—through stories, personalities, laughter, and the surprise of new encounters. You may have always felt that love is something you can give in a thousand creative ways. 

The Three does not simply feel—it performs feeling. It puts warmth into words. It turns care into gestures. It can be beautifully verbose in its affection, as if the heart itself is an instrument and you’re here to play it out loud. But there is a refinement here that matters, especially for the healer, coach, and leader. Because the same gift that makes you so engaging can also become a subtle defense. 

If you are always expressing, you don’t have to pause long enough to listen. If you are always dazzling, you don’t have to risk being ordinary. If you are always “on,” you don’t have to feel what’s underneath the performance. The Three of Hearts can sometimes talk at life instead of letting life speak back. And when this happens, the heart begins to hunger—not for more attention, but for deeper satisfaction. In distortion, this can show up as wanting to be liked by everyone while quietly disliking what feels unresponsive, unimpressed, or unavailable. Not because you are unkind, but because your nervous system equates attention with safety. 

If the applause fades, the Three can feel exposed. If the feedback doesn’t come, you may judge the room, judge the audience, judge the people around you—because it’s easier to critique than to admit you want to be seen. Yet your deepest truth is not performance. 

It is celebration. You are here to celebrate life. To remind people of joy without bypassing depth. To lead others back to their hearts through laughter, connection, and genuine presence. And when this card is aligned, you become someone people trust—not because you are entertaining, but because your warmth is real.`
  },
  "4c": {
    title: "4 of Clubs",
    subtitle: "Healer Code",
    body: `If you are a Four of Clubs, your mind is always working – always imagining what comes next. You carry an inner engine that turns ideas into structures, visions into systems, and inspiration into something real enough to hold, share, teach, and build upon. You don’t just imagine what could be — you can see the steps. You can sense the sequence. You can feel the architecture of success as if it’s already laid out in front of you. This is one of the great gifts of your chart: you translate. You take what is invisible and give it form. You can gather wisdom from many places and package it in ways that actually reach people. You can hear a complex idea and see how it can be brought to life – literally. And because you can do this, you often find yourself synthesizing ideas for others. You can see frameworks, communities, family structures, teams, missions, businesses, movements. You don’t just hold the vision; you hold the drive to fulfill it.

You also move faster than most. You can accomplish in a week what others would need a season to complete. There’s a natural momentum in you — a willingness to do the work, to follow through, to keep going, to keep refining. And the world tends to respond to that. When you are aligned, success is not mysterious to you. You can see what will work, and you are willing to do what it takes to make it work.

But this is also where your edge lives. Because with all this capacity, you can start to believe you are the one who must implement everything you see. You can start carrying the whole vision alone simply because you’re capable. You can overwork, overbuild, and overcommit yourself into exhaustion — not because you don’t love what you’re doing, but because it can be hard to slow down when you are doing what you love. And because you can see every detail so clearly, it can feel easier to do it yourself than to slow down and bring others into the build.

Your fulfillment, though, does not live in solitary achievement. It lives inside a group dynamic. Your chart is deeply team-oriented. You are meant to lead within a collective — whether that is a family, a business, a community, or a creative partnership — where the vision is shared and the weight is distributed. Your brilliance expands when you let yourself be supported.`
  },
  "4d": {
    title: "4 of Diamonds",
    subtitle: "Healer Code",
    body: `If you are a 4 of Diamonds, you are here to build something that feels bigger than life—and then bring it all the way down into form. You often carry a kind of dream in your bloodstream: a desire for relationships, connections, and experiences that feel magical, meaningful, and larger than the ordinary. There is something charismatic and compelling about the way you see the world, as if you're always sensing the hidden potential inside what's right in front of you.

And yet, you are not only a dreamer. You are structured expression. The "4" gives you the capacity to create a container, a framework, a path—something people can actually step into and experience. You can take an idea that feels too big to hold and shape it into something clear, tangible, and useful. This is part of why you can be such a powerful healer, coach, or leader: your vision doesn't have to stay in the clouds. You can translate it into a real offering, a real structure, a real impact in the physical world.

But here is one of your more tender shadows: you can do all of this hoping it will earn you love. You may work hard to be seen as passionate, devoted, magnetic—someone worthy of being admired and adored. The dreamy part of you can be intoxicating, even to yourself, and it can be easy to lose track of where the vision ends and the need for approval begins. When that happens, you can find yourself building an entire life that looks inspiring from the outside while you quietly wonder why it doesn't feel as nourishing on the inside as you hoped it would.`
  },
  "4h": {
    title: "4 of Hearts",
    subtitle: "Healer Code",
    body: `To be the Four of Hearts is to be born with an inner blueprint of what could be. You don’t just look at life and see what is. You look at life and feel what it is trying to become. You can sense the highest version of a relationship, the most beautiful version of a community, the most inspiring version of a business, a program, a movement, a family system. Your heart carries a kind of architectural hope. It doesn’t only dream—it often sees the steps, the structure, the “how,” the pathway that could bring something into form.

This is why you can feel both magnetic and misunderstood. People are drawn to you because your vision makes them feel hopeful again. Your presence can restore the part of someone that forgot what was possible. You are often likable in a way that seems effortless—because your belief in people is real, and your desire to bring out the best in them is sincere.

And yet, the Four of Hearts lives with a particular tension: you can blur the line between vision and illusion. Not because you are naïve, but because your heart is committed to the ideal. You can want every marriage to work. You can want every conversation to end in unity. You can want every group to come together and finally agree. You can feel a world where everyone remembers love—and then feel the ache when the current world doesn’t match what you can see.

Your gift is not to lower your standards or dim your light. Your gift is to become a steady steward of your vision. To remember that your role is not to force the world to live in your ideal, but to create the space where people can grow toward it. When you hold that truth, you become a builder of possibility instead of a defender of fantasy.`
  },
  "5c": {
    title: "5 of Clubs",
    subtitle: "Healer Code",
    body: `If you are a Five of Clubs, you carry a kind of blessing that is not always visible from the outside, but it is unmistakable over time. There is something about you that moves through the material world with support. When you make a decision and act on it, doors tend to open. Resources tend to appear. The funding, the opportunity, the right connection, the unexpected yes — these things often follow you. This does not mean life is effortless. It means you are resourced.

You are someone who gathers momentum quickly. You gather people. You gather ideas. You gather impact. You may become the center of a family system, the head of a business, the driving force of a mission. Your presence influences outcomes in ways you do not always recognize. You generate movement in the lives of others simply by deciding to move in your own.

And yet, the heartbeat of your chart is freedom. You value the freedom to think independently. The freedom to build what you want. The freedom to pivot without asking permission. The freedom to follow your instincts. When you feel restricted, something in you tightens. When you feel autonomous, something in you flourishes. This independence makes you powerful — and it can also isolate you. Because when you are confident in your direction, you do not always welcome input. You can become so clear in your own reasoning that collaboration feels like interference.

But your journey is not about losing your independence. It is about softening the edges around it. The Five of Clubs is blessed in the physical world, yes. But the deeper blessing is not money. It is influence. It is the ability to shape environments. And the refinement of your chart lies in remembering that your greatest impact is not measured by what you accumulate — it is measured by how open your heart remains while you build.`
  },
  "5d": {
    title: "5 of Diamonds",
    subtitle: "Healer Code",
    body: `If you are a Five of Diamonds, you experience the physical world intensely. You value freedom in a way that feels almost sacred. Movement, change, variety, new experiences—these are not luxuries for you. They feel necessary. You are often willing to try what others hesitate to attempt. You will leap before everyone else has finished thinking. There is boldness in you. There is appetite. There is a desire to taste life fully rather than observe it from a safe distance.

And because this is Diamonds, your playground is the material realm—money, health, opportunity, the body, resources, tangible experiences. When your energy is ungrounded, that intensity can become extreme. You may move too quickly. Spend too quickly. Commit too quickly. You may follow adrenaline rather than discernment. Financial highs and lows, physical burnout, cycles of excess followed by recovery—these can become familiar rhythms when your freedom is running the show without guidance.

But when you are aligned, something remarkable happens. Your ability to pivot becomes a gift. You can see opportunities others miss. You know when something is no longer working and you are not afraid to cut it away. You assess risk with a kind of instinctive clarity. You can invest wisely, build wealth wisely, and even guide others in making strong decisions about their material world. There is something alchemical in you. You can take what looks unstable and turn it into growth.

Your journey is not about suppressing freedom. It is about harmonizing it. You are here to learn how to enjoy the physical world without being ruled by it. To experience prosperity without excess. To move swiftly when needed—and to stay when staying is what will build something lasting.`
  },
  "5h": {
    title: "5 of Hearts",
    subtitle: "Healer Code",
    body: `To be the Five of Hearts is to be born as a catalyst for emotional change. You are not here to simply feel what you feel and call it a day. You are here to move feeling. To loosen what is stuck. To bring the heart back into motion when it has become rigid, guarded, resigned, or afraid. There is a restlessness in this card, but it isn’t random. It is the soul’s way of saying, there is more life in here than we have allowed ourselves to live.

This is why freedom matters to you so much. You love beauty, color, play, connection, creativity. You love sharing your ideas with the world. You love the spark of beginnings and the pleasure of possibility. You often carry a naturally magnetic presence—people can feel your warmth and your aliveness.

And yet, beneath all of that, the Five of Hearts can carry a very tender wound: the early pressure of being enough, the feeling of being left, the ache of not quite finding the kind of care you long for. Even when you are surrounded by people, there can be a subtle sense that something is missing—something you can’t quite name, but can definitely feel.

Because of that tenderness, discernment becomes one of your core initiations. The Five of Hearts often becomes skilled at reading people, sensing misalignment, noticing when something doesn’t add up. You learn quickly where love is real and where it is only a performance. And this is a gift for a healer, coach, or leader—because you can help others name what their heart has been trying to whisper for a long time.

But this gift can also turn into a pattern of leaving. Leaving before you are left. Pivoting before you have to feel disappointment. Abandoning the thing you love the moment it becomes vulnerable enough to matter. Your birth card is not asking you to give up freedom. It is asking you to discover a deeper kind of freedom—the freedom that comes from staying present with your own heart, even when it is disappointed. Even when it is scared. Even when it would rather disappear into the next beginning than face the tenderness of completion.`
  },
  "6c": {
    title: "6 of Clubs",
    subtitle: "Healer Code",
    body: `If you are the Six of Clubs, you were born with a mind that seeks balance. You are one of the most naturally discerning cards in the mental realm. You can take in information without immediately drowning in it. You can evaluate details, sense patterns, and understand what is actually happening beneath the surface of a situation. When others feel overwhelmed by data, you begin sorting it. When others are confused, you begin organizing. Your nervous system, at its best, does not panic in complexity. It looks for balance.

You value harmony over disruption. You do not enjoy unnecessary conflict. You do not make decisions lightly, especially when those decisions will ripple into the lives of people you care about. You can often see exactly what needs to change — but hesitate because you are aware of the emotional cost. You want everyone to be okay. You want the shift to feel smooth. You want transformation to be gentle.

But here is the deeper truth of your chart: your growth is activated by decisiveness. The Six of Clubs can spend too long debating between good options. You can circle ideas instead of choosing one. You can weigh every variable instead of declaring the vision. And while your discernment is a gift, your power is released the moment you say, “This is the direction.”

When you know your larger vision, information stops overwhelming you. It becomes supportive. Details become tools instead of distractions. The tension between ideas dissolves because they now have a central point to organize around. You are not here to avoid disruption at all costs. You are here to lead transformation with steadiness.`
  },
  "6d": {
    title: "6 of Diamonds",
    subtitle: "Healer Code",
    body: `If you are a Six of Diamonds, your life often feels like a conversation with value—what matters, what's worth it, what's truly supportive, what is asked of you, and what you are allowed to receive. There can be seasons where you feel like the luckiest person in the room—where doors open, resources appear, and the physical world seems to respond to you with surprising generosity. And then there can be other seasons where the very same physical world feels heavy, demanding, and full of responsibility. The swing can be confusing until you realize the deeper teaching: you are learning how to hold prosperity with grace, not pressure.

The Six of Diamonds is a harmony card. It asks you to love what is and still welcome what more can be. It teaches you to respect what you already have—your home, your health, your resources, your environment, the people you care for—without losing your appetite for growth and expansion. You are not meant to choose between gratitude and desire. You are meant to learn how they can coexist in the same heart: appreciation for what is here, and openness to what wants to arrive next.

As a healer, coach, or leader, this is a deep initiation because you often carry a natural sense of responsibility for others. When you see what's possible, you don't just want it for yourself—you want it for your community, your clients, your family, your team. You want everyone to thrive. You want to be part of what helps people feel supported in real, tangible ways. And the lesson is not to lose that generosity. The lesson is to make sure your generosity doesn't quietly become the way you abandon yourself.`
  },
  "6h": {
    title: "6 of Hearts",
    subtitle: "Healer Code",
    body: `To be the Six of Hearts is to carry a love that wants to do something with itself. This is one of the first hearts that doesn’t only wish for a more loving world—it looks at what’s missing and feels a genuine impulse to step forward and participate. You can sense what would help. You can see what would improve. You often have a practical kind of compassion that says, If I can make the environment kinder, safer, steadier… why wouldn’t I?

And because you can see what could change, you can feel an immense pressure to perform. To take tangible action again and again. To be productive, active, physically focused. Many Six of Hearts learn early that love is expressed through effort—through being useful, reliable, available, responsive. And you are often very good at it. You can build businesses. Impact families. Support communities. Step into roles where other people feel held simply because you are there.

But there is a tender distortion that can sneak in: you begin to give love outward so consistently that you forget to include yourself in the circle of care. You become skilled at harmonizing everyone else—making sure no one is upset, no one is angry, no one is frustrated—yet you quietly miss the importance of balancing your own experience. Your love becomes a service, but not always a nourishment.

The deeper invitation of the Six of Hearts is not to stop helping. It is to stop believing you must hold the world in order for love to exist inside it. You are not here to control reality into harmony. You are here to demonstrate harmony—by being grounded, discerning, and devoted, while also being well, rested, supported, and fully alive.`
  },
  "7c": {
    title: "7 of Clubs",
    subtitle: "Healer Code",
    body: `If you are the Seven of Clubs, you were born with a mind that does not stop at the surface. You do not simply want information. You want understanding. The Clubs suit governs thought, language, and learning, and the Seven introduces depth, discernment, and spiritual questioning. Together, they create the seeker-teacher of the deck. You are not satisfied with knowing what works. You want to understand why it works. You think something through from multiple angles, and once you grasp it, you feel compelled to integrate it into your own lived experience before sharing it. Knowledge for you is not theoretical. It must become embodied.

This is why teaching often becomes a natural extension of who you are. You are continually gathering insight, refining it, and translating it into language that others can use. Whether you stand on stages, write books, build curriculum, or simply guide your family, you are wired to transmit wisdom.

There is also something quietly spiritual about your mind. After enough analysis, you begin to see the limits of analysis. You recognize that some truths cannot be fully explained, only experienced. This awareness softens your intellect and opens you to something beyond logic — not instead of it, but alongside it.

As a healer, coach, or leader, your maturation comes when you stop trying to master knowledge and begin stewarding it. You are not here to know everything. You are here to continually deepen your understanding and share what is true for you now, with integrity and openness.`
  },
  "7d": {
    title: "7 of Diamonds",
    subtitle: "Healer Code",
    body: `If you are a Seven of Diamonds, you often carry a heart that is both tender and ambitious at the same time. You want to be loved. Not as a passing feeling, not as a brief moment of attention, but as a deep, steady experience of being cared for and seen for who you truly are. And because your suit is Diamonds, love can easily become tangled with the physical world—compliments, gifts, affection, achievement, beauty, success, the things that can be counted and noticed and measured. It's as if part of you is trying to "prove" love exists by making it visible.

This is where the Seven of Diamonds becomes such a profound initiation. Because love, the thing you want most, is not something you can weigh or quantify. It can't be secured through perfection. It can't be guaranteed by being the best, looking the best, winning the most, or earning the most. And yet the drive to be extraordinary can be very strong in you. It can become fuel—fuel for achievement, for growth, for expanding your world, for creating a life that feels rich and beautiful and full. But it can also become exhausting, especially when your body is the one that eventually has to say, "Slow down. I can't keep up with this pace."

There is also a genuine love of life in you that deserves to be honored. You tend to love beauty. You tend to love play. Many Seven of Diamonds feel most alive in the arts, in nature, in movement, in travel, in physical experience—anything that lets you taste the world rather than merely survive it. And this is important, because part of your healing is realizing that the world is not something that must comply in order for you to feel loved. The world is a place where you get to experience your own love—through participation, through attention, through the way you pour your heart into what you're living.

When you awaken to that truth, something loosens. You begin to let yourself and others off the hook from perfection. You begin to see that love is not a transaction where you perform and life rewards you. Love is the current that can move through you while you are alive. It is felt in the way you meet a moment, not only in the outcome you get from it.`
  },
  "7h": {
    title: "7 of Hearts",
    subtitle: "Healer Code",
    body: `If you are the Seven of Hearts, you were not born naïve about love. You were born perceptive. You have the kind of heart that has watched love up close—close enough to notice where people say the right things while living a different truth. Close enough to recognize the subtle ways devotion can become manipulation. Close enough to feel how quickly someone’s tenderness can disappear when their comfort is threatened. Because of what you have seen, you don’t fall for sweetness alone. You’re moved by integrity. You’re moved by follow-through. You’re moved when someone’s actions match their words, not once, but consistently.

This is the turning point inside the Hearts kingdom. The Seven is where love stops being only a feeling and starts becoming a question. What is love in practice? What does it look like when it has to show up on a hard day? What does it look like when it costs something—time, effort, humility, responsibility? Your heart is learning to include discernment and reality, not as a defense, but as maturity.

And yet, this card holds a tender paradox. Because while you may appear skeptical, you are not loveless. You are deeply devoted. The reason you notice distortion is because you care. The reason you demand consistency is because you know how sacred love actually is.

But if you’ve experienced enough disappointment, a quiet hardening can begin to form—not the loud kind, but the subtle kind that says, Maybe I should expect less. Maybe wanting more is foolish. Maybe I should protect myself by needing less.

Your mastery is not to become softer in the way people expect. Your mastery is to become truer in the way your soul requires. To refuse fantasy without losing hope. To demand embodied love without becoming suspicious. To hold standards without becoming closed. As a healer, coach, or leader, this makes you extraordinary at naming what others feel but cannot articulate. You can sense relational imbalance quickly. You can feel where someone is abandoning themselves “to keep the peace.” And because you’ve lived the lesson, you can guide people back to a love that is not performed, but practiced.`
  },
  "8c": {
    title: "8 of Clubs",
    subtitle: "Healer Code",
    body: `If you are an Eight of Clubs, devotion is built into your bones. You do not approach life halfway. When you choose a path, you stay with it. When you commit to a project, you see it through. When you believe in something, you give it your mind, your time, and your loyalty. There is an extraordinary steadiness in you that others depend on. You are reliable. You are resilient. You are someone who can sustain momentum long after others would have drifted away.

This staying power is not small. It is one of the reasons prosperity, well-being, and stability often follow you. You do not abandon what matters at the first sign of difficulty. You are willing to go down the rabbit hole. To understand. To refine. To keep going until something feels fully expressed.

And yet, this same devotion can become confinement if you are not attentive. Because while you long for continual transformation, you also resist changing course. You want growth without disruption. Expansion without letting go. You would prefer to evolve the path you are on rather than leave it entirely. So you hold steady. You remain loyal. You stay committed — sometimes even when your spirit has begun to shift. This can create a quiet heartbreak. You may watch others move on while you remain. You may feel the sting of being left behind, not because you lacked value, but because your loyalty kept you rooted while the season was changing.

Over time, you begin to realize that devotion is sacred — but it must breathe. The Eight of Clubs is not here to cling. It is here to commit consciously, and then release consciously when the path has completed its purpose.`
  },
  "8d": {
    title: "8 of Diamonds — Your Birth Card",
    subtitle: "Designed to Generate Prosperity",
    body: `If you are an Eight of Diamonds, you are designed to generate prosperity. Not as a vague hope, not as a someday prayer, but as a lived capacity. You can see momentum. You can see the steps.

You can look at a plan and feel almost unbothered by the amount of work it requires, because something in you understands how creation happens in the physical realm — one step after another, one choice after another, one act of devotion at a time.

You are often unusually capable with details, logistics, and follow-through, and you may find yourself in roles where you're building something tangible — something that grows because you show up for it consistently.

This is why so many Eight of Diamonds become successful in very grounded, practical ways.

You might be someone who works directly with the body, with hands-on service, with a craft, with a business that requires real-world management. You may have an instinct for production, operations, systems, and outcomes. You know how to create something sustainable.

You know how to scale what works. You know how to leverage support and invite others to help you fulfill what you see.

And yet, there is a tenderness here that matters. Because what comes so naturally to you — building, producing, executing — can also become the very thing that hides you.

You can become the one in the background making everything happen while quietly longing to be recognized, respected, and taken seriously as more than a producer.

You may feel that people only notice what you do, not who you are. And beneath that longing is something even deeper: a desire to know yourself.

To feel close to yourself. To discover what you truly love, not just what you are capable of making successful.

This is one of the great secrets of the Eight of Diamonds: you can build almost anything. But your fulfillment is not found in building everything.

Your fulfillment is found in building what genuinely nourishes your soul. And this chart is going to keep leading you back to that question until you answer it with your whole heart.`
  },
  "8h": {
    title: "8 of Hearts",
    subtitle: "Healer Code",
    body: `To be the Eight of Hearts is to live with a very particular kind of devotion. You are not only sensitive. You are not only loving. You are steady. There is a momentum in you that knows how to show up, day after day, and keep building something meaningful—especially when other people lose heart, lose focus, or lose faith. You can hold a vision for community. You can feel what it would mean for a family, an organization, or a movement to rally around something true. And because you can feel that possibility so vividly, you often carry a deep desire to bring people together—into purpose, into belonging, into shared direction.

Yet the Eight of Hearts is also one of the first places in the Hearts kingdom where the heart begins to feel the weight of the world. Not because your love is flawed, but because the world often measures “importance” differently than you do. The world tends to praise financial success more loudly than emotional fulfillment. It celebrates output more than tenderness. It rewards what can be quantified. And when you’re an Eight of Hearts, you can start to interpret your own worth through that external lens—almost without realizing it.

You may find yourself doing all the right things, showing up, working hard, building stability… and still feeling a quiet question underneath it all: Is this really it? Is this actually my purpose? Why don’t I feel as fulfilled as I thought I would?

This is one of the most tender paradoxes of your birth card. You may appear capable, strong, reliable, and determined, while privately carrying the ache of feeling misunderstood—especially in your emotional nature. The Eight of Hearts often learns to tone down their outpouring of affection because it can feel “too much” for a world that doesn’t always know how to receive love without trying to leverage it.

Over time, that suppression can create overwhelm. You can keep producing. You can keep serving. You can keep building. But the heart begins to ask for something deeper than success: it asks for meaning.

As a healer, coach, or leader, this is part of what makes you so powerful. You know what it is to do everything “right” and still feel empty. You understand the gap between accomplishment and fulfillment. And because you understand it, you can guide others back to the place where their life becomes an inside-out experience again—not measured by applause, but by alignment.`
  },
  "9c": {
    title: "9 of Clubs",
    subtitle: "Healer Code",
    body: `If you are a Nine of Clubs, you carry a mind that is always nearing completion… and yet rarely feels complete. You are here to fulfill ideas. To bring mental chapters to their end. To turn learning into mastery. And when you are aligned, you are capable of becoming an expert — not in the shallow sense of knowing facts, but in the deeper sense of living inside a subject long enough that it becomes part of you.

But the Nine of Clubs can feel scattered, not because you lack intelligence, but because you are carrying so much. Your nature is expansive. Your chart holds a balance of multiple energies, which can create the feeling that you should understand everything. You take in information and make sense of it quickly. You see how ideas can be applied. You can connect concepts across disciplines. And yet, because you can see so many paths, you may struggle to choose one.

This is where the emotional undercurrent often enters. There can be a longing inside you that is not purely mental — the longing to be loved, the longing to be valuable, the belief that you must sacrifice yourself for others in order to belong. And when that longing becomes the hidden driver, your focus dissolves.

You may downplay your career or your calling, even though your mind is sharp enough to create something extraordinary. You may find yourself thinking endlessly… without taking action. Or choosing a direction… and then becoming bored because another idea pulls your attention.

The deeper truth is that you need two things at once. You need structure that stabilizes your life. And you need a path you genuinely believe in — something your heart can pour itself into, something with a deeper “why” that makes your mind willing to stay. This is not a flaw. It is the initiation of your chart. You are here to discover what you love enough to finish.`
  },
  "9d": {
    title: "9 of Diamonds",
    subtitle: "Healer Code",
    body: `If you are a Nine of Diamonds, you tend to live with a quiet intensity that other people can feel, even when you don't speak about it. Your standards are high—not because you're trying to impress anyone, but because something in you is devoted to an idea of perfection. You want to know the highest possibility in any situation. You want to choose what is most aligned. You want to live with integrity that doesn't wobble when it's inconvenient. And because you are a Diamond, this devotion often shows up through what you create in the physical world—your work, your craft, your offerings, your art, your contributions, the tangible way you bring beauty and value to life.

This can be a gift and a burden at the same time. The gift is your artistry and your precision. You don't skim the surface. You look from every angle. You refine, sculpt, shape, improve, and polish until something feels complete. There's a kind of reverence in the way you work—like you're honoring the creation by not letting it be sloppy. But the burden is the inner pressure that can come with it. The sense that you must always be your best. The relentless private conversation about whether you've done enough, whether it's right enough, whether you're being integral enough. And when you live with that pressure for too long, other people can start to feel like they "fall short" around you—not because you're mean, but because your internal bar is set so high that it becomes hard to understand why others don't push the way you push.

There is also a more tender truth here: sometimes perfection is not only about excellence. Sometimes it is a way of avoiding endings. The Nine of Diamonds can love the creative process so much that completion feels like a kind of loss. Even when you're proud of what you made, there can be a bittersweet feeling in the final moment—because finishing means it's time to release. It's time to let go. It's time to step into the next chapter. So you refine a little longer. You adjust one more detail. You make it harder than it has to be. Not because you're incapable of finishing, but because part of you doesn't want the journey to end.

And this creates a fascinating paradox: you want to be cared for, supported, and prosperous... and yet you may quietly sabotage that support because it would mean you'd have to stop, receive, and rest. You might give money away just to have to rebuild it again. You might create new goals the moment the old ones are achieved. You might keep moving because the creative journey feels safer than the stillness of fulfillment. This isn't a flaw. It's a pattern asking for love.`
  },
  "9h": {
    title: "9 of Hearts",
    subtitle: "Healer Code",
    body: `To be the Nine of Hearts is to carry the ache and the promise of fulfillment in the same breath. You are not indifferent to love. You are not casual about connection. You feel responsible for it. Responsible for the emotional temperature of a room. Responsible for whether people feel cared for. Responsible for whether harmony is restored. There is something in you that wants to experience love at the highest scale—to know it deeply, to give it generously, to receive it fully. And beneath that longing is an even deeper desire: to finally feel cared for yourself.

The Nine of Hearts can begin life with a heaviness that is difficult to articulate. You may have felt responsible for others very early. You may have felt that your capacity to love was greater than what was reflected back to you. You may have sensed that if you just loved enough, gave enough, stayed enough, endured enough, someone would eventually take care of you in return. And so you may have overgiven. You may have stayed in relationships that were unkind but materially secure. You may have confused being provided for with being cherished.

This is not weakness. It is an initiation. Because the Nine of Hearts is not here to beg for fulfillment. It is here to embody it. You are not here to secure love through sacrifice. You are here to discover that your value does not depend on how indispensable you are to someone else’s life. The higher expression of this birth card is a profound one: I love because I am love. I give because it is natural to me. But I do not need to smother others with my devotion in order to be worthy of care.

As a healer, coach, or leader, you understand unrequited love. You understand what it feels like to pour yourself into something and wonder if it will ever return in equal measure. And because you understand it, you can guide others out of that pattern—not by hardening them, but by helping them reclaim their self-worth.`
  },
  "Ac": {
    title: "Ace of Clubs",
    subtitle: "Healer Code",
    body: `If you are an Ace of Clubs, you were born with a mind that wakes up early. You don’t just think—you initiate thought. You bring fresh ideas, new angles, and unexpected solutions into the rooms you walk into, often without even trying. There’s a bright, catalytic quality to you, like you’re here to start things that other people didn’t yet realize were possible. And yet, your chart isn’t only mind. There is heart here too—an undeniable desire to belong, to connect, to be part of the living pulse of community. You may feel two instincts moving through you at once: a fierce independence that needs space, and a deep relational pull that wants celebration, family, friendship, and shared life. You’re not meant to choose one over the other. You’re meant to learn the art of honoring both without abandoning yourself.

In the earlier chapters of your life, this card can feel like identity is something you have to earn. You may have measured yourself through the eyes of others—how you’re received, whether you’re accepted, whether you “matter” in the ways you hope to matter. Not because you’re shallow, but because the Ace is the beginning. It is the first step of self-definition. And for you, that self-definition is powerful enough that it can become vulnerable: when you don’t know who you are yet, you can reach for external feedback to steady your sense of self.

But you are not here to be defined by approval. You are here to be defined by truth. As a healer, coach, or leader, this becomes one of your greatest gifts. You can help people name what they haven’t been able to name. You can help them locate their own clarity. You can translate complexity into insight. And when you’re aligned, your mind doesn’t become a weapon or a defense—it becomes a lantern. You don’t use intellect to distance yourself from feeling. You use intelligence to bring people home to themselves.

Still, there’s an edge to this Ace. You love new ideas… but you may struggle when someone else brings a new idea that challenges yours. This is not a flaw—it’s a growth point. The Ace wants to lead. The initiation energy wants to be the one that sets direction. Your work is not to stop leading. It’s to lead without needing to be the only light in the room. Because the most mature expression of the Ace of Clubs is not control. It’s confidence. It’s the kind of confidence that can stay open, curious, and`
  },
  "Ad": {
    title: "Ace of Diamonds",
    subtitle: "Healer Code",
    body: `If you are an Ace of Diamonds, you carry the energy of beginnings in the physical realm. You are here to start things that other people only think about. You bring freshness into rooms that have gone stale. You can walk into a situation with very little context and somehow know what to do next—what to adjust, what to improve, what to initiate, what to offer. There is a quiet brilliance to that. Not performative. Practical. Immediate. You don't just envision possibility—you activate it.

And because Diamonds are tied to value, resources, the body, beauty, and earthly stewardship, you often feel an instinctual relationship with aesthetics and presentation. You notice what looks aligned and what doesn't. You feel what is current, youthful, and alive. Your presence can naturally lift the energy of what you touch because you have an eye for beauty.

Yet underneath that bright initiating power, there is something far more tender than most people realize. The Ace of Diamonds often carries a hidden longing: to be loved, adored, seen, and cherished for who you are. You may be praised for your results, while secretly craving devotion.

You may be appreciated for what you produce, while quietly hoping someone will recognize the softness that lives inside you. When that tenderness is overlooked, it can create an ache that's hard to name, because from the outside you seem so capable.

This is one of your lifelong spiritual lessons as a healer, coach, or leader: allowing yourself to be valued not only for what you can do, but for who you are. The world will happily celebrate your competence. Your work is to not abandon your heart while you're building your life. And to remember that being an initiator doesn't mean you're meant to live in perpetual starting beginner's mode. It means you're meant to learn how to begin with honesty—so what you start has a chance to become real love, real sustainability, and real legacy.`
  },
  "Ah": {
    title: "Ace of Hearts",
    subtitle: "Healer Code",
    body: `To be the Ace of Hearts is to carry love at its source-point. Not love as romance, not love as performance, not love as something you earn or bargain for—but love as an original frequency. The kind that remembers what matters before the world teaches you what to chase. There is often something quietly luminous about you, even when you don’t feel luminous at all. 

You can walk into a room and sense what is missing—not because you are judging it, but because your heart is tuned to wholeness. And yet, this card can feel tender in a way few people understand. Because when you carry love as an ideal, the world can feel startlingly loud, blunt, or distracted. 

You may have felt unseen—like your sincerity didn’t translate, like your devotion landed in places that couldn’t hold it, like you were speaking a language of the heart that others only pretended to know. That can create a quiet hesitation: a reluctance to give yourself fully until you are sure it is safe, sure it is real, sure it is worth the offering. The Ace of Hearts is not here to “learn how to love.” 

You already know how. 

You are here to learn what love looks like when it becomes embodied—when it takes shape in choices, boundaries, follow-through, and actual lived devotion. That is where your power is. Not in withdrawing your heart to protect it, and not in pouring it into everything indiscriminately, but in becoming someone who can recognize what is worthy of your love and let your love become real through action. 

As a healer, coach, or leader, this gives you an uncommon gift. You can feel the difference between true care and emotional theatre. You can sense when someone is trying to be “nice” versus when they are being honest. You can recognize when a space is aligned with love—and when it is simply decorated with spiritual language. Your chart is not asking you to lose your idealism. It is asking you to mature it, so it becomes guidance instead of longing.`
  },
  "Jc": {
    title: "Jack of Clubs",
    subtitle: "Healer Code",
    body: `If you are a Jack of Clubs, you are standing in one of the most delicate transitions in the entire mental suit. You have spent much of your life learning. Observing. Studying. Listening. Gathering insight from mentors, books, systems, conversations, lived experience. You do not approach the world casually. You want to understand it. You want to see how it works beneath the surface. And because of that, you often know more than you let on.

But there comes a moment — and you can feel it — when learning is no longer enough. The Jack of Clubs marks the point where the mind begins to whisper, “It is time to contribute.” Not repeat what you have learned. Not echo someone else’s framework. Contribute. And that is where the discomfort begins.

Because to contribute, you must trust that what is forming inside of you has value. You must risk developing your own way of thinking, your own language, your own process. And for someone who has spent years refining what others have built, that shift can feel destabilizing. You may delay it by staying in student mode. You may gather one more certification, read one more book, attend one more training. You may tell yourself that when you are fully formed, then you will step forward.

But here is the deeper message of your birth card: You do not become the teacher by finishing your education. You become the teacher by beginning your expression. As a healer, coach, or leader, this is the initiation. You are not here to know everything. You are here to develop the courage to share what you know now — and allow it to refine as you grow.`
  },
  "Jd": {
    title: "Jack of Diamonds",
    subtitle: "Healer Code",
    body: `If you are a Jack of Diamonds, you are often one of the most magnetic people in the room without even trying. There is a likability to you that feels effortless—playful, animated, enthusiastic, full of spark. People tend to enjoy being around you. They feel uplifted. They feel entertained. They feel your energy and, for a moment, life feels lighter just because you're present.

And yet, beneath that easy charm, there is often a very private story unfolding. The Jack of Diamonds can feel far less confident on the inside than they appear on the outside. You may know exactly how to "show up" in a way that looks assured—how to speak, how to engage, how to present yourself—while quietly questioning your own capacity. You might wonder if you truly know enough. If you're skilled enough. If you can actually deliver what you want to be known for.

This is why the Jack of Diamonds is such an initiation into integrity. Because you don't just want to be liked. You want to be respected. You want to be honored as someone wise, someone capable, someone who can truly guide, teach, lead, and make a difference. And when you don't yet feel that competence in yourself, it can be tempting to lean even harder into charisma—to let your outer confidence become a mask for the inner uncertainty.

Your path is not here to shame that instinct. Your path is here to mature it. You are learning how to let your confidence become real—not performed. How to let your sparkle become anchored in skill. How to let your influence become something people trust because you've earned it through devotion, not because you've sold it through charm.`
  },
  "Jh": {
    title: "Jack of Hearts",
    subtitle: "Healer Code",
    body: `To be the Jack of Hearts is to stand at the very center of the emotional kingdom. This is not a light placement. It carries a gravity that you likely felt long before you had language for it. There is a quiet imprint in this chart that says, If something matters, I will sacrifice for it. If someone is hurting, I will carry some of that pain. If love is needed, I will give it—even if it costs me.

This is why this archetype has long been associated with the martyr. There is an instinctual willingness to put yourself on the line for what you believe in. To take on the project no one else wants. To stay up later. To give more. To absorb the emotional weight so others don’t have to. And if you look back across your life, you may see how early this pattern began.

You likely witnessed sacrifice. You likely internalized the belief that everything meaningful requires loss. That if you want love, you must earn it. That if you want impact, you must exhaust yourself. That if you want connection, you must give more than you receive.

And yet, this is only the distorted side of your initiation. The awakened Jack of Hearts does not disappear into sacrifice. They transform through love. They allow the losses, the disappointments, the heartbreaks to deepen their capacity for compassion without erasing themselves in the process. They crave a tactile, embodied experience of life. They want to be in it. Hands in the dough. Feet in the water. Fully present. Fully engaged. Fully transformed by what they touch.

As a healer, coach, or leader, you are capable of sitting in the rawest human experiences without flinching. You can hold grief. You can hold shame. You can hold regret. You can witness people at their most vulnerable and remain steady. But your mastery lies in learning that your life is not meant to be a perpetual altar of sacrifice. It is meant to be a living channel of love.`
  },
  "Kd": {
    title: "King of Diamonds",
    subtitle: "Healer Code",
    body: `If you are a King of Diamonds, you were born with a rare mix of tenderness and authority. On the surface, the Diamonds suit is the material kingdom: resources, stewardship, prosperity, value, and the structures that make a life sustainable. But as a King, you carry the Diamond realm in its highest expression. You are here to lead in the world of matter. Not as someone who chases money for its own sake, but as someone who understands what wealth is actually for: to create stability, impact, and a foundation that can hold love.

And yet, the beginning of your story often surprises people—because your heart is where you start. You can feel, almost immediately, that you are here to care. To nurture. To make people feel safe with you. You may have grown up believing the "real" measure of your success was whether others felt seen, held, remembered, and provided for in your presence. You may have taken on the unspoken role of emotional caretaker long before you were meant to. Not because anyone demanded it outright, but because you could feel what people needed... and part of you couldn't relax until it was handled.

This is why harmony matters so much to you. Not as a preference, but as a survival strategy your nervous system learned early. Peace can feel like proof that you are safe. Conflict can feel like a threat to the very thing you are trying to build. So you may find yourself smoothing, managing, adjusting, anticipating—trying to keep the field around you calm enough to function. The irony is that the more you try to preserve harmony at all costs, the more exhausted you become... and the more your life begins to ask you for a deeper kind of leadership.

Because the King of Diamonds is not here to avoid tension. You are here to mature through it—until your leadership becomes strong enough to hold both love and truth without collapsing into people-pleasing.`
  },
  "Kh": {
    title: "King of Hearts",
    subtitle: "Healer Code",
    body: `To be the King of Hearts is to live as a visionary of love. You can see creative potential as if it’s already real. You can hear someone describe an idea and immediately picture the entire blueprint—how it would look, how it would feel, how it would function, how it would land in the world. It’s almost like breathing for you. Imagination is not a hobby. It is a native language.

And because you can see so much, so quickly, one of the most tender challenges of your chart is that people don’t always understand what you’re saying. You may feel as if you’re describing something obvious, something vivid, something already formed, and others look back at you blankly or underestimate what you’re articulating. This can create a quiet frustration. Not because you need applause, but because you know what you see is real—and you want others to trust it too.

The King of Hearts carries a kind of closeness to Source: the feeling-sense of what’s possible arriving before words can capture it. And your chart asks you to trust this. Not by trying to convince people with more explanation, but by letting your vision integrate long enough to become demonstrable.

As a healer, coach, or leader, this is one of your great gifts. You can help people dream again. You can help them remember possibility. You can feel the “next chapter” of their life before they can. But your leadership becomes most powerful when you learn that articulation isn’t the goal. Embodiment is. You are here to make love visible through what you build.`
  },
  "Qc": {
    title: "Queen of Clubs",
    subtitle: "Healer Code",
    body: `If you are the Queen of Clubs, you were not designed to simply think about ideas, you were born to bring them to life. The Clubs suit governs thought, communication, and strategy. The Queen embodies maturity, composure, and inner authority. Together, they create someone who does not simply generate ideas — you steward them. You can take inspiration and shape it into something viable, structured, and potentially impactful in the world.

And as a healer, coach, or leader, this is not a small gift. You are someone who can take a scattered insight and give it form. You can take a vision and make it viable. You are capable of nurturing an idea from its earliest stage — holding it, refining it, protecting it — until it becomes substantial enough to stand on its own. Many people dream. Fewer people gestate. You gestate.

But here is where your initiation begins. Because you see so clearly, you may sometimes remain in the realm of vision longer than necessary. You may strategize, refine, and map possibilities without stepping fully into physical implementation. The Queen of Clubs can sometimes live in the brilliance of the plan rather than the messiness of execution.`
  },
  "Qd": {
    title: "Queen of Diamonds",
    subtitle: "Healer Code",
    body: `If you are a Queen of Diamonds, your life rarely feels still. You are positioned in a way that pulls experiences toward you quickly, sometimes so quickly that it can feel like you're living inside a moving river. Opportunities, people, invitations, ideas, paths, and possibilities tend to rotate around you. It's not that you are indecisive by nature. It's that your field is responsive—almost magnetic—and life gives you more options than most people know what to do with.

Early in the journey, this can create a particular kind of tension: you may feel like you have to choose the "right" thing quickly, before it disappears. And when you feel that pressure, your system may swing into chasing. Chasing prosperity. Chasing the next level. Chasing security. Chasing the feeling of being "set." And yet, what often happens for the Queen of Diamonds is that the more you chase wealth at the expense of relationship, the more empty it can feel—even if you're winning.

Then, as life evolves, there can be a second swing. You start chasing relationship. Connection. Belonging. Romance. Approval. The feeling of being chosen. And sometimes this second swing happens at the expense of your career, your calling, or your devotion to what you know you're here to build. It's an archetype that can move between "If I have enough money, I'll be okay" and "If I have enough love, I'll be okay," as if fulfillment lives on one side of the scale.

But your chart is not here to punish you with that pendulum. It's here to reveal something far more powerful: chasing either love or prosperity pushes them further away. Your path is not to pursue what you want from a place of lack. It is to become the embodiment of what you're seeking—so that love and wealth can unfold naturally as outcomes of who you are, not prizes you have to secure.

When the Queen of Diamonds matures, you become a conduit. Money flows in and out. Relationships flow in and out. Experiences arrive, move through you, and leave you wiser. You stop clenching around life and start trusting the rhythm of life. And that trust becomes your prosperity.`
  },
  "Qh": {
    title: "Queen of Hearts",
    subtitle: "Healer Code",
    body: `To be the Queen of Hearts is to live with your heart right at the surface of your life. You don’t merely feel love—you radiate it. You want people to feel cared for in your presence. You want tenderness to be the atmosphere. You want the people around you to soften, to exhale, to remember they are safe. There is a maternal current in this card, a nurturing force that can hold others in ways they have rarely been held.

You are often the one who notices what someone needs before they ask. You feel the unspoken. You sense the quiet ache behind someone’s smile. And because your love is so accessible, your chart carries a very specific temptation: to push love onto others. Not because you are manipulative, but because your devotion is intense.

When you care, you want it returned. When you rescue, you want appreciation. When you show up, you want recognition. And if you have been pouring yourself into people who cannot reciprocate, the Queen of Hearts can become confused and frustrated.

Why doesn’t the world mirror back what I give? Why can’t people love as deeply as I do? This is where the Queen of Hearts can begin living from entitlement without realizing it—entitlement not as arrogance, but as emotional desperation wearing a crown. It can sound like: I have done so much. I have sacrificed so much. Surely this means I should finally be met. And when you aren’t met, the heart can tighten. Love can start to feel like a bargain rather than a gift.

But the higher expression of this card is one of the most beautiful archetypes in the deck. It is the nurturer who loves without needing to control reality into affirmation. It is the healer who serves without insisting the world say thank you. It is the leader who learns that love is not something you force people to return—it is something you embody, and then you discern who is capable of honoring it. This is the Queen of Hearts at her highest: an infinite stream of love flowing through someone who has learned to include themselves in that stream.`
  },
  "As": {
    title: "Ace of Spades",
    subtitle: "Healer Code",
    body: `If you are an Ace of Spades, you were not born into a simple life. You were born into a contemplative one. From a very early age, you have felt what others often avoid — the fragility of life, the reality of loss, the presence of death, the inevitability of change. You may not have had language for it as a child, but you felt it. You sensed that things end. That people leave. That life can shift without warning. And because of that, you have always carried a depth that sets you apart.

The Ace of Spades sits between worlds. Not metaphorically — experientially. You may feel pulled between the material and the spiritual, between what is seen and unseen, between what is stable and what is dissolving. There is often upheaval around you — family changes, career transitions, sudden endings, unexpected beginnings. It can feel like your life moves in waves of transformation rather than gentle seasons. And because of that, stability may feel like something you are always building, and rebuilding, and building again.

And yet, here is the paradox: you are rarely shocked by transformation. While others panic in moments of crisis, you steady. While others are overwhelmed by endings, you hold space.

You have likely been present at births, deaths, divorces, collapses, reinventions. You understand shadow work not because you studied it, but because you lived it. Many Ace of Spades become doulas of one kind or another — birth doulas, death doulas, transition guides, shadow workers — not necessarily by title, but by function. You are the one people call when everything is changing.

But your deepest lesson is not simply to witness transformation. It is to participate in it. Because the Ace is initiation. It is the spark. And your life is not asking you to survive upheaval — it is asking you to let transformation initiate you into leadership.`
  },
  "2s": {
    title: "2 of Spades",
    subtitle: "Healer Code",
    body: `If you are a 2 of Spades, you carry an extraordinary capacity to read the room. Not just intellectually. Not just socially. But energetically. You walk into a space and something in you immediately begins processing — who feels safe, who feels unsettled, what is unspoken, where the tension lives, what the group needs. It happens fast. Often before you even consciously register it.

This ability was not random. For many 2 of Spades, it was born from necessity. Something early in your life required you to awaken your intuition quickly. Perhaps it was instability. Perhaps it was emotional unpredictability. Perhaps it was simply being the sensitive one in a complex environment. Whatever the catalyst, your intuition opened because it had to. And once it opened, it never really closed.

As a healer, coach, or leader, this makes you powerful. You don't just teach principles — you anticipate needs. You don't just respond — you pre-empt. You can give people what they didn't even know they needed because you can feel it forming before they articulate it. And in business, this becomes prosperity. You understand timing. You understand partnership. You know when to align and when to pivot. Decisions feel clearer to you than they do to many others — not because you always know why, but because your inner compass is tuned.

But here is the quiet shadow: you understand others far more easily than you understand yourself. You can navigate a room of fifty people with ease, yet struggle to name your own inner truth. You can manage energy externally while feeling less certain internally. And so the deeper journey of the 2 of Spades is not mastering people — it is mastering self-recognition.`
  },
  "3s": {
    title: "3 of Spades",
    subtitle: "Healer Code",
    body: `If you are a 3 of Spades, there is a particular kind of pressure you have lived with for as long as you can remember. It isn't only ambition. It isn't only responsibility. It is the feeling that these two currents are braided together inside of you — an inner drive to make something of your life, and an equally strong pull to make that life matter to other people. You are not easily satisfied by success that stays personal. You want impact. You want meaning. You want what you build to move someone's life from struggle into something more livable, more hopeful, more whole.

This is why your motivation has always been selective. When you can't feel the point of what you're doing, your energy fades — not because you are incapable, but because your spirit refuses to invest in what feels empty. Even when you were young, there was a sense that you needed to understand the deeper "why." You needed to know how everything was connected, how one choice affected another choice, how one action rippled into an entire system. And when you couldn't see that connection, life could feel like a series of tasks without meaning. But you were never designed to be motivated by performance. You were designed to be motivated by purpose.

And underneath all of that — under the drive, under the service, under the seriousness — there is something tender: the 3 of Spades wants to be understood. You want to be able to translate the vastness of what you are sensing into something other people can actually grasp. You want language that can hold what you feel. You want your inner world to be met. And because your chart pushes you toward solutions and contribution, you can spend years being the one who understands everyone else while quietly aching to be seen in your own complexity.

There is also this honest desire in you to be valued — not in a shallow way, but in a grounded way. You want to see that your work makes a difference. You want that difference to be tangible, day in and day out. You want to be able to look at your life and know that what you offered actually helped someone climb out of pain, confusion, or discomfort into something more satisfying. That desire is not ego. It is the 3 of Spades' integrity: if I'm going to give my life to something, it needs to matter.`
  },
  "4s": {
    title: "4 of Spades",
    subtitle: "Healer Code",
    body: `If you are a 4 of Spades, you are not designed to do your work in isolation. You love being with people. You love feeling a room come alive. You love celebration, play, the uplift that happens when human beings gather around something meaningful and feel themselves expand inside of it. There is something in you that is nourished by community — not just by being present in it, but by watching it flourish. You notice what makes people light up. You notice what helps them feel safe enough to open. You notice what elevates an experience from "fine" to unforgettable.

And because you are a four, you don't merely want connection — you want container. You're focused on structure. Foundation. A space that can hold what wants to happen. But your structure is not just practical. It is emotional. It is energetic. It is relational. You are the kind of healer, coach, or leader who thinks about the experience people are having, the feelings a conversation is stirring, the depth a gathering could reach if it were held with more intention.

What's striking about this chart is that you don't always need to be the person delivering the message. You don't necessarily thrive as the "star." You thrive as the one who holds space — the one who creates the conditions where something profound can occur. A mastermind. A debate. A performance. An event. A healing circle. A family conversation. A hospital room. A classroom. Your gift is the ability to sense what's needed and cultivate it into form.

There is also something visionary here. You don't only create spaces that work — you imagine spaces that last. You can see legacy. You can imagine something that grows and deepens over time: an annual event, a long-standing community, a structure that serves people for decades. Your mind naturally stretches beyond the moment and into what this could become if it were built with care.`
  },
  "5s": {
    title: "5 of Spades — Transformed Self",
    subtitle: "Healer Code",
    body: `If you are a 5 of Spades, life rarely asks you to live in only one lane. You are the kind of healer, coach, or leader who feels deeply responsible for people, and at the same time driven by ambition — not because you're "attached to success," but because something in you is genuinely motivated to build, achieve, and leave a mark. It can feel like you were born with two sacred callings that don't always seem to fit in the same room: care for others and express your passion through the world.

And because both feel true, you can spend years trying to "balance" them, as if the only way forward is to divide yourself into parts. But this chart isn't asking you to choose. It's asking you to integrate — to stop segmenting your purpose into separate identities and let it become one coherent life. When that clicks, you stop feeling like you're constantly managing two destinies, and you begin living from a deeper ease: the same energy that helps you care is the energy that helps you succeed.

What changes then isn't your workload — it's your inner posture. You no longer need to "prove" you're devoted to people by carrying them, and you no longer need to "prove" you're committed to your path by pushing yourself past what's sustainable. You start building in a way that includes your heart instead of costing you your heart.

The 5 of Spades is also a card of lived transformation. You don't just understand change — you've lived through enough of it to become fluent. In early seasons, that fluency can come from vigilance: watching what's shifting, reading the room, tracking what might change next so you can protect yourself from being blindsided. Over time, that same sensitivity becomes a gift: you become someone who can feel when a turning point is real, when a pattern is ready to break, when an era is complete. But the deeper invitation is to stop treating transformation as something you must manage and start relating to it as something you can serve — in yourself first, and then in others.`
  },
  "6s": {
    title: "6 of Spades",
    subtitle: "Healer Code",
    body: `If you are a 6 of Spades, your chart carries a kind of "on paper" strength that other people often admire from the outside. You tend to have the capacity to build a life that looks stable, capable, successful — sometimes even enviable. When you apply yourself, you can generate real results. You can create comfort. You can create prosperity. You can create a life that feels, at least externally, like it should be satisfying.

And yet, what's so important to name is that many 6 of Spades eventually realize they've paid for that stability with themselves. You can devote yourself to a path and become very good at it. You can hold a high level of responsibility and keep delivering. You can keep going longer than most people. But over time, the inner feeling that often accompanies that is: I'm overworked. I'm carrying too much. I'm burned out. Not because you are weak. Because you've been strong for too long without the right kind of support.

The 6 of Spades often lives with an internal pressure that says, "I have to be the one who stabilizes everything." In career. In family. In life. You may feel like you need to see the situation from the highest perspective, make the best decision, protect everyone around you, and outwork everyone to prove you deserve what you have. Your mind is rarely still. You are thinking, analyzing, processing, assessing, trying to find the best possible solution in every scenario.

And eventually, something has to give. Often the body is the first messenger. Because your body can only carry a certain amount of over-delivery before it starts to speak up in symptoms. Sometimes it is health. Sometimes it is family stress. Sometimes it is a life event that makes it unmistakably clear: no amount of work will actually get you ahead in the way you believe it will.

The 6 of Spades is not here to be punished by life. You are here to be awakened out of a misunderstanding: the belief that you must earn peace through effort.`
  },
  "7s": {
    title: "7 of Spades",
    subtitle: "Healer Code",
    body: `If you are a 7 of Spades, you were born with a doorway open inside you. In your early years especially, you may have lived more in imagination than in the world around you. Not because you were avoiding life in a lazy way, but because your inner world was so alive it could feel more real than what was happening in front of you. You contemplated. You daydreamed. You wandered into possibility. You imagined a kinder world, a more beautiful world, a more enchanted world. There is something almost woodland-whimsical in this card — like the child who could walk through the forest and feel fairies in the air, not as fantasy, but as the felt sense that life is more than what we can explain.

And because that dream-world is so vivid, the physical world can feel loud, conflicted, demanding. You may have felt pulled toward nature early on because nature held something your nervous system could trust. Nature didn't argue. Nature didn't manipulate. Nature didn't require you to choose sides. Nature simply was. And in that "being," you could find your own anchor.

What's important to understand is that your dreaminess is not a flaw to correct. It is a gift to mature. You are an incredible dreamer. You can see a transformed world that other people cannot yet see. You can imagine solutions, futures, harmonies, new possibilities.

But the challenge of the 7 of Spades is that this vision can sometimes be used as a refuge — a way to keep life beautiful in the mind so you don't have to face the conflict you are trying to avoid. The 7 of Spades often wants to nurture the world into a higher vision so they can ignore what hurts, what is tense, what is broken, what needs confrontation. And this is where your chart begins to initiate you: you are not here to avoid the world. You are here to help it.`
  },
  "8s": {
    title: "8 of Spades",
    subtitle: "Healer Code",
    body: `If you are an 8 of Spades, you have likely lived much of your life balancing two forces inside you: what you feel you have to do, and what you genuinely want to do. You can feel obligation in the air — expectations from others, roles you've been given, pressures that seem to quietly follow you. And at the same time, there is a sincere inner drive to build a life that is yours, a life that reflects what you actually care about, not just what others assume you should carry.

There is also a peculiar kind of blessing that follows this card. Things can "work out" for you in ways that surprise people. Doors open. Support appears. Luck shows up at just the right moment. And yet, that same blessing can create its own burden — because when life seems to take care of you, people can unconsciously decide you are the one who can take care of everyone. They want something from you. They want you to help. They want you to hold. They want you to be the steady one. So your gift becomes a magnet, and your kindness becomes a responsibility you never formally agreed to.

You are also one of the hardest working cards when you are aligned. Not because you are trying to prove yourself, but because you have seen how success works. When you keep taking action in the physical world, things change. When you keep showing up, momentum builds. When you commit to a direction, it tends to lead somewhere good. So you are willing to do the work. You are willing to self-reflect. You are willing to evolve. And that combination — action plus reflection — makes you powerful.

But what you truly crave is not just money, even though money often follows you. What you crave is fulfillment. You want to feel valued. You want to feel like your effort matters. You want to be part of something meaningful, something that actually helps people. You are deeply loving. Deeply kind. And because that love is real, you can sometimes forget that not everyone is doing the inner work the way you are.

You may recognize the pattern: unrequited love. Sudden endings. The feeling that you are not fully loved the way you want to be loved. Or the quieter, more private truth — you can't quite find the one. And underneath it all is a yearning for something that feels ultimate, mature, mutual, true.`
  },
  "9s": {
    title: "9 of Spades",
    subtitle: "Healer Code",
    body: `If you are a 9 of Spades, you tend to find yourself standing at the edge of extremes. People come into your life when they are at their breaking point. When the burden is heavy. When the addiction is loud. When the despair is real. When the spiritual crisis feels like it might undo them. You attract those who are at the very peak of challenge — or the very brink of breakthrough. And over time, you begin to understand something most people don't: those two moments are often the same.

There is something in your presence that does not flinch at intensity. You can sit in rooms where others feel overwhelmed. You can stay grounded when someone is unraveling. You can witness deep pain without judging it, and without collapsing into it. This is not accidental. It is a frequency. It is a capacity. You were designed to hold depth.

But in the beginning of your journey, you may not know how to hold that depth without taking it on. When someone is suffering, you may feel that it is your responsibility to rescue them. When someone is at their lowest, you may believe you must give more of yourself in order to make sure they survive it. You can confuse your ability to hold space with an obligation to carry someone else's weight. And that is where this chart begins to test you.

You are not here to drown with the people you help. You are here to remain steady while they learn how to swim.`
  },
  "10s": {
    title: "10 of Spades",
    subtitle: "Healer Code",
    body: `If you are a 10 of Spades, you can feel consequence moving through the world in real time. Not in a paranoid way. Not in a superstitious way. In a deeply sensitive, almost immediate way — like you can sense that the moment you put something into motion, life responds. Cause and effect doesn't feel abstract to you. It feels personal. It feels fast. It feels like the universe is always giving you feedback, sometimes before you even finish forming the thought.

This is why the 10 of Spades often carries a frequency of karmic responsibility. You tend to feel an intense need to be ethical, integral, aligned with your values, and true — not just because it's "the right thing," but because you know what happens when you aren't. Your system respects higher ideals. You can sense that integrity is not merely moral — it is practical. It is how you navigate reality with less friction.

But living this way comes with a cost if you don't understand it. Because when consequence feels immediate, control becomes tempting. You may try to control your mind so you don't "attract" something negative. You may try to control relationships so nothing destabilizes. You may try to control outcomes so you can stay safe. And because you are intelligent and self-aware, you can become one of the most monitored charts of all — constantly evaluating yourself, adjusting, improving, correcting, trying to stay pure, trying to stay right, trying to stay ahead of karma.

This is where the 10 of Spades can overwork inside their mind. You may think constantly. Review constantly. Manage constantly. You can become an expert in awareness while feeling strangely disconnected from the lived world. It can start to feel easier to be aware than to be embodied. Easier to observe than to act. Easier to "know" than to build. And for a healer, coach, or leader, that can create a quiet ache: I can see what needs to change... but why does it feel so hard to implement it?`
  },
  "Js": {
    title: "Jack of Spades",
    subtitle: "Healer Code",
    body: `If you are a Jack of Spades, you can feel two worlds tugging at you — almost like two different versions of you are trying to steer the same life. One part of you wants the tangible things. You want stability. You want your needs met. You want to build a life that works in the physical world — money handled, responsibilities managed, a sense that your daily reality is solid enough to rest inside.

And then there is the other part of you — the part that cannot forget higher meaning. You feel purpose. You feel vision. You feel an almost magnetic pull toward wisdom that goes beyond surface reality. You want to understand what is actually happening underneath life: the forces of timing, the currents of transformation, the unseen intelligence that shapes why things unfold the way they do. You are wired for initiation.

This creates a very specific pattern early on. You want to understand deeper wisdom — but only enough to get the results you want. Not because you are lazy. Because you are practical. You may feel like there is too much to do, too many responsibilities, too much pressure to "get life together" to spend real time in devotion. So you try to shortcut the path. You try to learn just enough to change your outcomes without surrendering into the spaciousness true growth requires.

And when you live from that shortcut energy, life tends to feel harder. Your charisma can still draw people in, but you may feel like you're constantly managing outcomes. Like you're trying to control situations so things work. Like people don't want to pay you, or resources don't flow the way you expect. It can feel strangely frustrating: you have the magnetism, you have the ideas, you have the capacity — and yet the material world won't "lock in" the way you want it to until you stop trying to use it as proof that you're safe.`
  },
  "Qs": {
    title: "Queen of Spades",
    subtitle: "Healer Code",
    body: `If you are a Queen of Spades, you have a direct line to wisdom that often surprises even you. You can see what is happening underneath what is happening. You can sense the hidden pattern, the real motive, the deeper truth, the inevitable consequence. Sometimes you understand things you have no logical reason to understand. It simply arrives — clear, immediate, undeniable — like an inner knowing that doesn't require permission.

And yet, one of the most defining experiences of this card is how quickly you can doubt yourself. The very brilliance that moves through you can make you question your own sanity, your own credibility, your own right to speak. You may feel the impulse to prove what you know, justify what you know, explain it perfectly, gather feedback that confirms you are not making it up. You may quietly monitor how others respond, hoping to see recognition in their eyes that matches the depth of what you are seeing.

This can create a loop that is exhausting in its subtlety. Wisdom comes through. Doubt rises. You attempt to prove. You attempt to convince. You attempt to gather evidence. And because the world often cannot meet you at the level of your perception, you can end up feeling like you are living inside a private reality — rich, true, and vivid — yet constantly questioned by the part of you that wants external validation before you take action.

As a healer, coach, or leader, this can show up as a strange hesitation. You may be the one who sees what no one else sees, and yet be the last one to speak. Not because you lack courage, but because you're still trying to find the perfect way to say it. You're trying to make it land. You're trying to make it undeniable. You're trying to make sure nobody can dismiss you. And the irony is that the more you try to prove your knowing, the more you postpone the very work you were born to do: share it.`
  },
  "Ks": {
    title: "King of Spades",
    subtitle: "Healer Code",
    body: `If you are a King of Spades, you are not here to think like everyone else. Your mind doesn't simply collect information. It sees. It finds vantage points other people don't even consider. You can look at a situation and sense the hidden architecture beneath it — the pattern underneath the pattern, the direction underneath the chaos, the inevitable consequence that no one else is naming yet. And because you can see that far, you can feel like you're living slightly outside the room, slightly above the conversation, slightly ahead of the timeline everyone else is tracking.

This is part of why this card can become reclusive. Not always physically, but energetically. When your awareness is that active, it can feel easier to stay inside your mind than to participate in the messiness of human exchange. It can feel easier to observe than to engage. And when you're not careful, you can start to drift into a kind of isolation that looks like "independence," but actually feels like disconnection.

What makes this even more complex is that you aren't cold inside. You may look distant, but you often deeply want connection. You want celebration. You want to feel included. You want the joy of being with people in a way that's simple. But when your mind is on all the time, your presence can feel split. And when others sense that split, they may interpret you as unreachable. Which can trigger another layer: the ego's desire to be acknowledged. To be seen as wise. To be recognized for how much you perceive and how much you contribute.

So the King of Spades carries a very specific life lesson: you are not meant to hide your wisdom, and you are not meant to demand recognition for it. You are meant to become a thought leader in the spaces that truly matter to you — not the leader of the world, not the president, not the one at the top of some arbitrary ladder, but the one who knows exactly where your wisdom can make the greatest difference, and is willing to place yourself there.`
  },
  "Kc": {
    title: "King of Clubs",
    subtitle: "Healer Code",
    body: `If you are a King of Clubs, your mind is not just active — it is sovereign. From a young age, you likely discovered that your thinking operated at a different register than the people around you. Not louder. Not necessarily faster. But wider. You could see connections that others missed, hold multiple frameworks at once, and sense when an idea had not yet been taken to its real conclusion. That capacity is your inheritance. The King of Clubs is the master of the mental kingdom — not someone who thinks for pleasure, but someone whose intelligence was always meant to serve a larger purpose.

The challenge that most Kings of Clubs eventually encounter is the gap between what the mind can perceive and what the world is ready to receive. You may have had ideas dismissed before they were finished. You may have tried to explain something you could see clearly — a pattern, a solution, an emerging reality — and watched the room look back at you with polite incomprehension. Over time, some Kings of Clubs begin to hold back. Not because they doubt the idea, but because they've learned the cost of speaking before the audience is ready.

This is where the real work begins. The King of Clubs carries a particular temptation: to confuse mental mastery with isolation. To decide that if people cannot keep up, you will simply stop reaching toward them. It looks like self-sufficiency. It can feel like dignity. But underneath it, there is often a quiet longing — to be understood not just for what you know, but for who you are beneath all the knowing.

What makes the King of Clubs most powerful is not what they withhold. It is what they choose to give. Your gift is not information — it is illumination. When you speak from a place of genuine desire to open something in another person, rather than to demonstrate your own depth, something shifts. You become not just someone who knows — but someone who transmits. That is a different kind of mastery entirely. The King of Clubs at their best is not the person with the most answers. They are the one who makes other people trust their own thinking.

As you mature, you will likely find your own relationship to authority transforming. You don't need to dominate the conversation to lead it. You don't need to be the expert in the room to change the room. What you carry — that original, structurally sharp, quietly revolutionary intelligence — is most potent when it is offered with warmth. Not with performance. Not with defensiveness. But with a genuine willingness to let your mind be in service of something beyond itself.`
  },
  "Jo": {
    title: "The Joker",
    subtitle: "Pure Potential — The Unassigned",
    body: `To be born as the Joker means you enter this lifetime without a narrow lane. Most Birth Cards carry a clear developmental arc. There is a recognizable tone to their personality, a consistent rhythm to their growth, and predictable themes that shape their path early. The Joker enters differently. Instead of a single dominant current, you arrive with range. From an early age, you may have noticed that you could move in multiple directions with equal competence. You could lead or support. You could build systems or disrupt them. You could nurture people or challenge them. You could reinvent yourself entirely and still feel authentic.

This range is not confusion. It is capacity. But without conscious direction, capacity can feel destabilizing. You may have struggled when asked to define yourself. You may have shifted roles, identities, or environments more than once. You may have felt frustrated by expectations to "pick one thing" while sensing that narrowing prematurely would cut off parts of you that are real and viable.

The Joker carries the frequency of Zero — not as emptiness, but as unassigned potential. Your design does not force a fixed identity. It requires conscious choice. That distinction matters. If you do not choose intentionally, life will choose through circumstance. You may drift between opportunities, pivot just as momentum builds, or resist structure because it feels limiting. Beneath that pattern is often a subtle concern: if I commit to one path, I lose access to the others.

In reality, the opposite is true. When you choose, your influence stabilizes. When you commit, your impact compounds. When you align intentionally — even for a defined season — your power becomes directional rather than scattered. The Joker's strength is not endless openness. It is sovereign selection.

Over time, most Jokers experience distinct phases of expression. There are seasons when you will lead primarily through connection — initiating emotional honesty, creating space for conversations others avoid, softening rigid systems without collapsing their structure. There are other seasons when you will lead through clarity and authority — valuing truth over approval, stabilizing uncertainty, making decisions that others hesitate to make. The refinement here is integrity under pressure: you must tolerate being misunderstood and trust your discernment without hardening emotionally.

Eventually, many Jokers mature into integration — where emotional intelligence and structural authority coexist. You no longer oscillate between over-giving and over-leading. You understand when to open space and when to direct movement. You can nurture without rescuing. You can lead without isolating. To support your highest expression, you can choose to follow the growth pattern of the King of Spades or the Ace of Hearts.

In distortion, the Joker can appear scattered. Projects remain unfinished. Roles shift frequently. Flexibility becomes avoidance. In alignment, something stabilizes. You begin choosing your lane consciously. You understand that selecting a focus does not erase your range — it strengthens it. You allow structure to support you instead of interpreting it as confinement. You recognize that discipline is not the opposite of freedom; it is the container that makes freedom productive.

You are uniquely equipped to guide reinvention because you have lived it. You can support those who feel undefined or in transition because you understand how identity evolves through choice. Your leadership becomes catalytic when you stop sampling life and start shaping it. You are not here to remain undefined. You are here to consciously decide what the world receives from you — and to deliver it fully.`
  },

};

const CARD_POSITION = {
  // Spades
  "As": "Pluto",
  "2s": "Neptune · Venus",
  "3s": "Jupiter · Saturn",
  "4s": "Venus · Jupiter",
  "5s": "Transformed Self — Mars · Venus",
  "6s": "Uranus · Neptune",
  "7s": "Jupiter · Uranus",
  "8s": "Saturn · Jupiter",
  "9s": "Uranus · Venus",
  "10s": "Saturn",
  "Js": "Uranus · Mars",
  "Qs": "Mercury · Uranus",
  "Ks": "Mercury",
  // Joker
  "Jo": "The Unassigned — Pure Potential",
  // Header row
  "Ks": "Mercury",
  "8d": "Birth Card",
  "10c": "Moon",
  // Top row — single planet
  "As": "Pluto",
  "3d": "Neptune",
  "5c": "Uranus",
  "10s": "Saturn",
  "Qc": "Jupiter",
  "Ac": "Mars",
  "3h": "Venus",
  // Main grid — Column Planet · Row Planet
  // Venus row
  "2h": "Neptune · Venus",
  "9s": "Uranus · Venus",
  "9c": "Saturn · Venus",
  "Jh": "Jupiter · Venus",
  "5s": "Mars · Venus — Transformed Self",
  "7d": "Cosmic Lesson",
  "7h": "Cosmic Result",
  // Mars row
  "8c": "Neptune · Mars",
  "Js": "Uranus · Mars",
  "2d": "Saturn · Mars",
  "4c": "Jupiter · Mars",
  "6h": "Mars · Mars",
  "Kd": "Venus · Mars",
  "Kh": "Mercury · Mars",
  // Jupiter row
  "Ad": "Neptune · Jupiter",
  "Ah": "Uranus · Jupiter",
  "8s": "Saturn · Jupiter",
  "10d": "Jupiter · Jupiter",
  "10h": "Mars · Jupiter",
  "4s": "Venus · Jupiter",
  "6d": "Mercury · Jupiter",
  // Saturn row
  "5d": "Neptune · Saturn",
  "7c": "Uranus · Saturn",
  "9h": "Saturn · Saturn",
  "3s": "Jupiter · Saturn",
  "3c": "Mars · Saturn",
  "5h": "Venus · Saturn",
  "Qd": "Mercury · Saturn",
  // Uranus row
  "Jd": "Neptune · Uranus",
  "Kc": "Uranus · Uranus",
  "2c": "Saturn · Uranus",
  "7s": "Jupiter · Uranus",
  "9d": "Mars · Uranus",
  "Jc": "Venus · Uranus",
  "Qs": "Mercury · Uranus",
  // Neptune row
  "Qh": "Neptune · Neptune",
  "6s": "Uranus · Neptune",
  "6c": "Saturn · Neptune",
  "8h": "Jupiter · Neptune",
  "2s": "Mars · Neptune",
  "4d": "Venus · Neptune",
  "4h": "Mercury · Neptune",
};

const BC_SUITS = [
  { name:'Hearts',   sym:'♥', suit:'h' },
  { name:'Diamonds', sym:'♦', suit:'d' },
  { name:'Clubs',    sym:'♣', suit:'c' },
  { name:'Spades',   sym:'♠', suit:'s' },
];
const BC_VALUES = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

const GRID = {
  header: [
    { card: "Ks", label: "Mercury" },
    { card: "8d", label: "Birthcard", highlight: true },
    { card: "10c", label: "Moon" },
  ],
  topRow: [
    { card: "As", label: "Pluto", healer: true },
    { card: "3d", label: "Neptune", healer: true },
    { card: "5c", label: "Uranus" },
    { card: "10s", label: "Saturn" },
    { card: "Qc", label: "Jupiter" },
    { card: "Ac", label: "Mars", healer: true },
    { card: "3h", label: "Venus" },
  ],
  rows: [
    ["2h","9s","9c","Jh","5s","7d","7h"],
    ["8c","Js","2d","4c","6h","Kd","Kh"],
    ["Ad","Ah","8s","10d","10h","4s","6d"],
    ["5d","7c","9h","3s","3c","5h","Qd"],
    ["Jd","Kc","2c","7s","9d","Jc","Qs"],
    ["Qh","6s","6c","8h","2s","4d","4h"],
  ],
  planets: ["♆","⛢","♄","♃","♂","♀","☿"],
  rowPlanets: ["♀","♂","♃","♄","⛢","♆"],
};

const SPECIAL_CARDS = {
  "5s": { sublabel: "Trans-\nFormed\nSelf", shade: true },
  "7d": { sublabel: "Cosmic\nLesson",       shade: true },
  "7h": { sublabel: "Cosmic\nResult",       shade: true, healer: true },
};

const BIRTH_CHARTS = {
  // 5 core Healer's Code cards per chart: Birthcard · Pluto · Neptune · Mars · Cosmic Result
  "2h": {
    highlights: {
      0: { "2h":{label:"Birthcard",healer:true}, "9s":{label:"Moon"} },
      1: { "8c":{label:"Neptune",healer:true}, "Js":{label:"Uranus"}, "2d":{label:"Saturn"}, "4c":{label:"Jupiter"}, "6h":{label:"Mars",healer:true}, "Kd":{label:"Venus"}, "Kh":{label:"Mercury"} },
    },
    specialCards: {},
  },
  "3h": {
    headerHighlights: { "Ks":{label:"Moon"} },
    topRowHighlights: {
      "As":{label:"Uranus"}, "3d":{label:"Saturn"}, "5c":{label:"Jupiter"}, "10s":{label:"Mars",healer:true},
      "Qc":{label:"Venus"}, "Ac":{label:"Mercury"}, "3h":{label:"Birthcard",healer:true},
    },
    highlights: {
      0: { "7d":{label:"Pluto",healer:true}, "7h":{label:"Neptune",healer:true} },
    },
    specialCards: {
      "9c":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "Jh":{sublabel:"Cosmic\nLesson",shade:true},
      "5s":{sublabel:"Cosmic\nResult",shade:true,healer:true},
    },
  },
  "4h": {
    headerHighlights: {
      "Ks":{label:"Cosmic Result",healer:true}, "8d":{label:"Pluto",healer:true}, "10c":{label:"Neptune",healer:true},
    },
    topRowHighlights: {
      "Ac":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "3h":{sublabel:"Cosmic\nLesson",shade:true},
    },
    highlights: {
      4: { "Jd":{label:"Moon"} },
      5: { "Qh":{label:"Uranus"}, "6s":{label:"Saturn"}, "6c":{label:"Jupiter"}, "8h":{label:"Mars",healer:true}, "2s":{label:"Venus"}, "4d":{label:"Mercury"}, "4h":{label:"Birthcard",healer:true} },
    },
    specialCards: {},
  },
  "5h": {
    highlights: {
      3: { "5d":{label:"Saturn"}, "7c":{label:"Jupiter"}, "9h":{label:"Mars",healer:true}, "3s":{label:"Venus"}, "3c":{label:"Mercury"}, "5h":{label:"Birthcard",healer:true}, "Qd":{label:"Moon"} },
      4: { "7s":{label:"Pluto",healer:true}, "9d":{label:"Neptune",healer:true}, "Jc":{label:"Uranus"} },
    },
    specialCards: {
      "Jd":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "Kc":{sublabel:"Cosmic\nLesson",shade:true},
      "2c":{sublabel:"Cosmic\nResult",shade:true,healer:true},
    },
  },
  "6h": {
    highlights: {
      1: { "8c":{label:"Jupiter"}, "Js":{label:"Mars",healer:true}, "2d":{label:"Venus"}, "4c":{label:"Mercury"}, "6h":{label:"Birthcard",healer:true}, "Kd":{label:"Moon"} },
      2: { "4s":{label:"Uranus"}, "6d":{label:"Saturn"}, "10d":{label:"Pluto",healer:true}, "10h":{label:"Neptune",healer:true} },
    },
    specialCards: {
      "Ad":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "Ah":{sublabel:"Cosmic\nLesson",shade:true},
      "8s":{sublabel:"Cosmic\nResult",shade:true,healer:true},
    },
  },
  "7h": {
    topRowHighlights: { "As":{label:"Moon"} },
    highlights: {
      0: { "2h":{label:"Uranus"}, "9s":{label:"Saturn"}, "9c":{label:"Jupiter"}, "Jh":{label:"Mars",healer:true}, "5s":{label:"Venus"}, "7d":{label:"Mercury"}, "7h":{label:"Birthcard",healer:true} },
      1: { "4c":{label:"Pluto",healer:true}, "6h":{label:"Neptune",healer:true} },
    },
    specialCards: {
      "2d":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "8c":{sublabel:"Cosmic\nLesson",shade:true},
      "Js":{sublabel:"Cosmic\nResult",shade:true,healer:true},
    },
  },
  "8h": {
    headerHighlights: { "Ks":{label:"Uranus"}, "8d":{label:"Saturn"}, "10c":{label:"Jupiter"} },
    topRowHighlights: {
      "5c":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "10s":{sublabel:"Cosmic\nLesson",shade:true},
      "Qc":{sublabel:"Cosmic\nResult",shade:true,healer:true},
      "Ac":{label:"Pluto",healer:true,shade:true},
      "3h":{label:"Neptune",healer:true,shade:true},
    },
    highlights: {
      5: { "Qh":{label:"Mars",healer:true}, "6s":{label:"Venus"}, "6c":{label:"Mercury"}, "8h":{label:"Birthcard",healer:true}, "2s":{label:"Moon"} },
    },
    specialCards: {},
  },
  "9h": {
    highlights: {
      3: { "5d":{label:"Venus"}, "7c":{label:"Mercury"}, "9h":{label:"Birthcard",healer:true}, "3s":{label:"Moon"} },
      4: { "Kc":{label:"Pluto",healer:true}, "2c":{label:"Neptune",healer:true}, "7s":{label:"Uranus"}, "9d":{label:"Saturn"}, "Jc":{label:"Jupiter"}, "Qs":{label:"Mars",healer:true} },
    },
    specialCards: {
      "Jd":{sublabel:"Cosmic\nResult",shade:true,healer:true},
      "4d":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "4h":{sublabel:"Cosmic\nLesson",shade:true},
    },
  },
  "10h": {
    highlights: {
      2: { "Ad":{label:"Jupiter"}, "Ah":{label:"Mars",healer:true}, "8s":{label:"Venus"}, "10d":{label:"Mercury"}, "10h":{label:"Birthcard",healer:true}, "4s":{label:"Moon"} },
      3: { "9h":{label:"Cosmic Result",healer:true}, "3s":{label:"Pluto",healer:true}, "3c":{label:"Neptune",healer:true}, "5h":{label:"Uranus"}, "Qd":{label:"Saturn"} },
    },
    specialCards: {
      "5d":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "7c":{sublabel:"Cosmic\nLesson",shade:true},
    },
  },
  "Ah": {
    highlights: {
      2: { "Ad":{label:"Mercury"}, "Ah":{label:"Birthcard",healer:true}, "8s":{label:"Moon"} },
      3: { "5d":{label:"Pluto",healer:true}, "7c":{label:"Neptune",healer:true}, "9h":{label:"Uranus"}, "3s":{label:"Saturn"}, "3c":{label:"Jupiter"}, "5h":{label:"Mars",healer:true}, "Qd":{label:"Venus"} },
    },
    specialCards: {
      "9d":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "Jc":{sublabel:"Cosmic\nLesson",shade:true},
      "Qs":{sublabel:"Cosmic\nResult",shade:true,healer:true},
    },
  },
  "Jh": {
    highlights: {
      0: { "2h":{label:"Mars",healer:true}, "9s":{label:"Venus"}, "9c":{label:"Mercury"}, "Jh":{label:"Birthcard",healer:true}, "5s":{label:"Moon"} },
      1: { "Kd":{label:"Saturn"}, "Kh":{label:"Jupiter"}, "2d":{label:"Pluto",healer:true}, "4c":{label:"Neptune",healer:true}, "6h":{label:"Uranus"} },
    },
    specialCards: {
      "6d":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "8c":{sublabel:"Cosmic\nLesson",shade:true},
      "Js":{sublabel:"Cosmic\nResult",shade:true,healer:true},
    },
  },
  "Kh": {
    highlights: {
      0: { "2h":{label:"Moon"} },
      1: { "8c":{label:"Uranus"}, "Js":{label:"Saturn"}, "2d":{label:"Jupiter"}, "4c":{label:"Mars",healer:true}, "6h":{label:"Venus"}, "Kd":{label:"Mercury"}, "Kh":{label:"Birthcard",healer:true} },
      2: { "10h":{label:"Cosmic Result",healer:true}, "4s":{label:"Pluto",healer:true}, "6d":{label:"Neptune",healer:true} },
    },
    specialCards: {
      "8s":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "10d":{sublabel:"Cosmic\nLesson",shade:true},
    },
  },
  "Qh": {
    headerHighlights: { "Ks":{label:"Mars",healer:true}, "8d":{label:"Venus"}, "10c":{label:"Mercury"} },
    topRowHighlights: {
      "As":{sublabel:"Cosmic\nLesson",shade:true},
      "3d":{sublabel:"Cosmic\nResult",shade:true,healer:true},
      "5c":{label:"Pluto",healer:true,shade:true},
      "10s":{label:"Neptune",healer:true,shade:true},
      "Qc":{label:"Uranus",shade:true},
      "Ac":{label:"Saturn"},
      "3h":{label:"Jupiter"},
    },
    highlights: {
      5: { "Qh":{label:"Birthcard",healer:true}, "6s":{label:"Moon"} },
    },
    specialCards: { "7h":{sublabel:"Trans-\nFormed\nSelf",shade:true} },
  },
  "8d": {
    headerHighlights: {
      "Ks": { label:"Mercury" },
      "8d": { label:"Birthcard", healer:true },
      "10c": { label:"Moon" },
    },
    highlights: {},
    specialCards: {
      "5s": { sublabel:"Trans-\nFormed\nSelf", shade:true },
      "7d": { sublabel:"Cosmic\nLesson",       shade:true },
      "7h": { sublabel:"Cosmic\nResult",       shade:true, healer:true },
    },
  },
  // ── Clubs ──────────────────────────────────────────────────────────────
  "2c": {
    headerHighlights: {
      "8d":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "10c":{sublabel:"Cosmic\nLesson",shade:true},
    },
    highlights: {
      4: { "Jd":{label:"Venus"}, "Kc":{label:"Mercury"}, "2c":{label:"Birthcard",healer:true}, "7s":{label:"Moon"} },
      5: { "Qh":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "6s":{label:"Pluto",healer:true}, "6c":{label:"Neptune",healer:true}, "8h":{label:"Uranus",healer:true}, "2s":{label:"Saturn"}, "4d":{label:"Jupiter"}, "4h":{label:"Mars",healer:true} },
    },
    specialCards: {},
  },
  "3c": {
    highlights: {
      3: { "5d":{label:"Jupiter"}, "7c":{label:"Mars",healer:true}, "9h":{label:"Venus"}, "3s":{label:"Mercury"}, "3c":{label:"Birthcard",healer:true}, "5h":{label:"Moon"} },
      4: { "Jd":{sublabel:"Trans-\nFormed\nSelf",shade:true}, "Kc":{sublabel:"Cosmic\nLesson",shade:true}, "2c":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "7s":{label:"Pluto",healer:true}, "9d":{label:"Neptune",healer:true}, "Jc":{label:"Uranus",healer:true}, "Qs":{label:"Saturn"} },
    },
    specialCards: {},
  },
  "4c": {
    highlights: {
      1: { "8c":{label:"Mars",healer:true}, "Js":{label:"Venus"}, "2d":{label:"Mercury"}, "4c":{label:"Birthcard",healer:true}, "6h":{label:"Moon"} },
      2: { "Ad":{sublabel:"Cosmic\nLesson",shade:true}, "Ah":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "8s":{label:"Pluto",healer:true}, "10d":{label:"Neptune",healer:true}, "10h":{label:"Uranus"}, "4s":{label:"Saturn"}, "6d":{label:"Jupiter"} },
    },
    specialCards: {
      "Qs":{sublabel:"Trans-\nFormed\nSelf",shade:true},
    },
  },
  "5c": {
    topRowHighlights: {
      "As":{label:"Venus"}, "3d":{label:"Mercury"}, "5c":{label:"Birthcard",healer:true}, "10s":{label:"Moon"},
    },
    highlights: {
      0: { "2h":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "9s":{label:"Pluto",healer:true}, "9c":{label:"Neptune",healer:true}, "Jh":{label:"Uranus",healer:true}, "5s":{label:"Saturn"}, "7d":{label:"Jupiter"}, "7h":{label:"Mars",healer:true} },
    },
    specialCards: {
      "Kd":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "Kh":{sublabel:"Cosmic\nLesson",shade:true},
    },
  },
  "6c": {
    headerHighlights: {
      "Ks":{label:"Saturn"}, "8d":{label:"Jupiter"}, "10c":{label:"Mars",healer:true},
    },
    topRowHighlights: {
      "As":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "3d":{sublabel:"Cosmic\nLesson",shade:true},
      "5c":{sublabel:"Cosmic\nResult",shade:true,healer:true},
      "10s":{label:"Pluto",healer:true},
      "Qc":{label:"Neptune",healer:true},
      "Ac":{label:"Uranus"},
    },
    highlights: {
      5: { "Qh":{label:"Venus"}, "6s":{label:"Mercury"}, "6c":{label:"Birthcard",healer:true}, "8h":{label:"Moon"} },
    },
    specialCards: {},
  },
  "7c": {
    highlights: {
      3: { "5d":{label:"Mercury"}, "7c":{label:"Birthcard",healer:true}, "9h":{label:"Moon"} },
      4: { "Jd":{label:"Pluto",healer:true}, "Kc":{label:"Neptune",healer:true}, "2c":{label:"Uranus"}, "7s":{label:"Saturn"}, "9d":{label:"Jupiter"}, "Jc":{label:"Mars",healer:true}, "Qs":{label:"Venus"} },
    },
    specialCards: {
      "2s":{sublabel:"Trans-\nFormed\nSelf",shade:true,healer:true},
      "4d":{sublabel:"Cosmic\nLesson",shade:true},
      "4h":{sublabel:"Cosmic\nResult",shade:true,healer:true},
    },
  },
  "8c": {
    highlights: {
      1: { "8c":{label:"Birthcard",healer:true}, "Js":{label:"Moon"} },
      2: { "Ad":{label:"Neptune",healer:true}, "Ah":{label:"Uranus"}, "8s":{label:"Saturn"}, "10d":{label:"Jupiter"}, "10h":{label:"Mars",healer:true}, "4s":{label:"Venus"}, "6d":{label:"Mercury"} },
      3: { "5d":{sublabel:"Trans-\nFormed\nSelf",shade:true}, "7c":{sublabel:"Cosmic\nLesson",shade:true}, "9h":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "3s":{label:"Pluto",healer:true} },
    },
    specialCards: {},
  },
  "9c": {
    highlights: {
      0: { "2h":{label:"Venus"}, "9s":{label:"Mercury"}, "9c":{label:"Birthcard",healer:true}, "Jh":{label:"Moon"} },
      1: { "8c":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "Js":{label:"Pluto",healer:true}, "2d":{label:"Neptune",healer:true}, "4c":{label:"Uranus",healer:true}, "6h":{label:"Saturn"}, "Kd":{label:"Jupiter"}, "Kh":{label:"Mars",healer:true} },
    },
    specialCards: {
      "4s":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "6d":{sublabel:"Cosmic\nLesson",shade:true},
    },
  },
  "10c": {
    headerHighlights: {
      "Ks":{label:"Venus"}, "8d":{label:"Mercury"}, "10c":{label:"Birthcard",healer:true},
    },
    topRowHighlights: {
      "As":{sublabel:"Cosmic\nResult",shade:true,healer:true},
      "3d":{label:"Pluto",healer:true},
      "5c":{label:"Neptune",healer:true},
      "10s":{label:"Uranus"},
      "Qc":{label:"Saturn"},
      "Ac":{label:"Jupiter"},
      "3h":{label:"Mars",healer:true},
    },
    highlights: {
      5: { "Qh":{label:"Moon"} },
    },
    specialCards: {
      "7d":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "7h":{sublabel:"Cosmic\nLesson",shade:true},
    },
  },
  "Ac": {
    topRowHighlights: {
      "As":{label:"Saturn"}, "3d":{label:"Jupiter"}, "5c":{label:"Mars",healer:true},
      "10s":{label:"Venus"}, "Qc":{label:"Mercury"}, "Ac":{label:"Birthcard",healer:true}, "3h":{label:"Moon"},
    },
    highlights: {
      0: { "9s":{sublabel:"Trans-\nFormed\nSelf",shade:true}, "9c":{sublabel:"Cosmic\nLesson",shade:true}, "Jh":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "5s":{label:"Pluto",healer:true}, "7d":{label:"Neptune"}, "7h":{label:"Uranus"} },
    },
    specialCards: {},
  },
  "Jc": {
    highlights: {
      4: { "Jd":{label:"Saturn"}, "Kc":{label:"Jupiter"}, "2c":{label:"Mars",healer:true}, "7s":{label:"Venus"}, "9d":{label:"Mercury"}, "Jc":{label:"Birthcard",healer:true}, "Qs":{label:"Moon"} },
      5: { "Qh":{sublabel:"Trans-\nFormed\nSelf",shade:true}, "6s":{sublabel:"Cosmic\nLesson",shade:true}, "6c":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "8h":{label:"Pluto",healer:true}, "2s":{label:"Neptune",healer:true}, "4d":{label:"Uranus"} },
    },
    specialCards: {},
  },
  "Kc": {
    headerHighlights: {
      "Ks":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "8d":{sublabel:"Cosmic\nLesson",shade:true},
      "10c":{sublabel:"Cosmic\nResult",shade:true,healer:true},
    },
    highlights: {
      4: { "Jd":{label:"Mercury"}, "Kc":{label:"Birthcard",healer:true}, "2c":{label:"Moon"} },
      5: { "Qh":{label:"Pluto",healer:true}, "6s":{label:"Neptune",healer:true}, "6c":{label:"Uranus"}, "8h":{label:"Saturn"}, "2s":{label:"Jupiter"}, "4d":{label:"Mars",healer:true}, "4h":{label:"Venus"} },
    },
    specialCards: {},
  },
  "Qc": {
    topRowHighlights: {
      "As":{label:"Jupiter"}, "3d":{label:"Mars",healer:true}, "5c":{label:"Venus"},
      "10s":{label:"Mercury"}, "Qc":{label:"Birthcard",healer:true}, "Ac":{label:"Moon"},
    },
    highlights: {
      0: { "2h":{sublabel:"Trans-\nFormed\nSelf",shade:true}, "9s":{sublabel:"Cosmic\nLesson",shade:true}, "9c":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "Jh":{label:"Pluto",healer:true}, "5s":{label:"Neptune",healer:true}, "7d":{label:"Uranus"}, "7h":{label:"Saturn"} },
    },
    specialCards: {},
  },
  // ── Diamonds ───────────────────────────────────────────────────────────
  "2d": {
    highlights: {
      1: { "8c":{label:"Venus"}, "Js":{label:"Mercury"}, "2d":{label:"Birthcard",healer:true}, "4c":{label:"Moon"} },
      2: { "Ad":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "Ah":{label:"Pluto",healer:true}, "8s":{label:"Neptune",healer:true}, "10d":{label:"Uranus"}, "10h":{label:"Saturn"}, "4s":{label:"Jupiter"}, "6d":{label:"Mars",healer:true} },
    },
    specialCards: {
      "5h":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "Qd":{sublabel:"Cosmic\nLesson",shade:true},
    },
  },
  "3d": {
    topRowHighlights: {
      "As":{label:"Mercury"}, "3d":{label:"Birthcard",healer:true}, "5c":{label:"Moon"},
    },
    highlights: {
      0: { "2h":{label:"Pluto",healer:true}, "9s":{label:"Neptune",healer:true}, "9c":{label:"Uranus"}, "Jh":{label:"Saturn"}, "5s":{label:"Jupiter"}, "7d":{label:"Mars",healer:true}, "7h":{label:"Venus"} },
    },
    specialCards: {
      "6h":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "Kd":{sublabel:"Cosmic\nLesson",shade:true},
      "Kh":{sublabel:"Cosmic\nResult",shade:true,healer:true},
    },
  },
  "4d": {
    headerHighlights: {
      "Ks":{label:"Pluto",healer:true}, "8d":{label:"Neptune",healer:true}, "10c":{label:"Uranus"},
    },
    topRowHighlights: {
      "Qc":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "Ac":{sublabel:"Cosmic\nLesson",shade:true},
      "3h":{sublabel:"Cosmic\nResult",shade:true,healer:true},
    },
    highlights: {
      5: { "Qh":{label:"Saturn"}, "6s":{label:"Jupiter"}, "6c":{label:"Mars",healer:true}, "8h":{label:"Venus"}, "2s":{label:"Mercury"}, "4d":{label:"Birthcard",healer:true}, "4h":{label:"Moon"} },
    },
    specialCards: {},
  },
  "5d": {
    highlights: {
      3: { "5d":{label:"Birthcard",healer:true}, "7c":{label:"Moon"} },
      4: { "Jd":{label:"Neptune",healer:true}, "Kc":{label:"Uranus"}, "2c":{label:"Saturn"}, "7s":{label:"Jupiter"}, "9d":{label:"Mars",healer:true}, "Jc":{label:"Venus"}, "Qs":{label:"Mercury"} },
      5: { "8h":{sublabel:"Trans-\nFormed\nSelf",shade:true}, "2s":{sublabel:"Cosmic\nLesson",shade:true}, "4d":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "4h":{label:"Pluto",healer:true} },
    },
    specialCards: {},
  },
  "6d": {
    highlights: {
      1: { "8c":{label:"Moon"} },
      2: { "Ad":{label:"Uranus"}, "Ah":{label:"Saturn"}, "8s":{label:"Jupiter"}, "10d":{label:"Mars",healer:true}, "10h":{label:"Venus"}, "4s":{label:"Mercury"}, "6d":{label:"Birthcard",healer:true} },
      3: { "9h":{sublabel:"Trans-\nFormed\nSelf",shade:true}, "3s":{sublabel:"Cosmic\nLesson",shade:true}, "3c":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "5h":{label:"Pluto",healer:true}, "Qd":{label:"Neptune",healer:true} },
    },
    specialCards: {},
  },
  "7d": {
    highlights: {
      0: { "2h":{label:"Saturn"}, "9s":{label:"Jupiter"}, "9c":{label:"Mars",healer:true}, "Jh":{label:"Venus"}, "5s":{label:"Mercury"}, "7d":{label:"Birthcard",healer:true}, "7h":{label:"Moon"} },
      1: { "Js":{sublabel:"Trans-\nFormed\nSelf",shade:true}, "2d":{sublabel:"Cosmic\nLesson",shade:true}, "4c":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "6h":{label:"Pluto",healer:true}, "Kd":{label:"Neptune",healer:true}, "Kh":{label:"Uranus"} },
    },
    specialCards: {},
  },
  "9d": {
    highlights: {
      4: { "Jd":{label:"Jupiter"}, "Kc":{label:"Mars",healer:true}, "2c":{label:"Venus"}, "7s":{label:"Mercury"}, "9d":{label:"Birthcard",healer:true}, "Jc":{label:"Moon"} },
      5: { "Qh":{sublabel:"Trans-\nFormed\nSelf",shade:true}, "6s":{sublabel:"Cosmic\nLesson",shade:true}, "6c":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "8h":{label:"Pluto",healer:true}, "2s":{label:"Neptune",healer:true}, "4d":{label:"Uranus"}, "4h":{label:"Saturn"} },
    },
    specialCards: {},
  },
  "10d": {
    highlights: {
      2: { "Ad":{label:"Mars",healer:true}, "Ah":{label:"Venus"}, "8s":{label:"Mercury"}, "10d":{label:"Birthcard",healer:true}, "10h":{label:"Moon"} },
      3: { "5d":{sublabel:"Cosmic\nLesson",shade:true}, "7c":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "9h":{label:"Pluto",healer:true}, "3s":{label:"Neptune",healer:true}, "3c":{label:"Uranus"}, "5h":{label:"Saturn"}, "Qd":{label:"Jupiter"} },
    },
    specialCards: {
      "Qs":{sublabel:"Trans-\nFormed\nSelf",shade:true},
    },
  },
  "Ad": {
    highlights: {
      2: { "Ad":{label:"Birthcard",healer:true}, "Ah":{label:"Moon"} },
      3: { "5d":{label:"Neptune",healer:true}, "7c":{label:"Uranus"}, "9h":{label:"Saturn"}, "3s":{label:"Jupiter"}, "3c":{label:"Mars",healer:true}, "5h":{label:"Venus"}, "Qd":{label:"Mercury"} },
      4: { "7s":{sublabel:"Trans-\nFormed\nSelf",shade:true}, "9d":{sublabel:"Cosmic\nLesson",shade:true}, "Jc":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "Qs":{label:"Pluto",healer:true} },
    },
    specialCards: {},
  },
  "Jd": {
    headerHighlights: {
      "Ks":{sublabel:"Cosmic\nLesson",shade:true},
      "8d":{sublabel:"Cosmic\nResult",shade:true,healer:true},
      "10c":{label:"Pluto",healer:true},
    },
    topRowHighlights: {
      "3h":{sublabel:"Trans-\nFormed\nSelf",shade:true},
    },
    highlights: {
      4: { "Jd":{label:"Birthcard",healer:true}, "Kc":{label:"Moon"} },
      5: { "Qh":{label:"Neptune",healer:true}, "6s":{label:"Uranus"}, "6c":{label:"Saturn"}, "8h":{label:"Jupiter"}, "2s":{label:"Mars",healer:true}, "4d":{label:"Venus"}, "4h":{label:"Mercury"} },
    },
    specialCards: {},
  },
  "Kd": {
    highlights: {
      1: { "8c":{label:"Saturn"}, "Js":{label:"Jupiter"}, "2d":{label:"Mars",healer:true}, "4c":{label:"Venus"}, "6h":{label:"Mercury"}, "Kd":{label:"Birthcard",healer:true}, "Kh":{label:"Moon"} },
      2: { "Ad":{sublabel:"Trans-\nFormed\nSelf",shade:true}, "Ah":{sublabel:"Cosmic\nLesson",shade:true}, "8s":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "10d":{label:"Pluto",healer:true}, "10h":{label:"Neptune",healer:true}, "4s":{label:"Uranus"} },
    },
    specialCards: {},
  },
  "Qd": {
    highlights: {
      2: { "Ad":{label:"Moon"} },
      3: { "5d":{label:"Uranus"}, "7c":{label:"Saturn"}, "9h":{label:"Jupiter"}, "3s":{label:"Mars",healer:true}, "3c":{label:"Venus"}, "5h":{label:"Mercury"}, "Qd":{label:"Birthcard",healer:true} },
      4: { "2c":{sublabel:"Trans-\nFormed\nSelf",shade:true}, "7s":{sublabel:"Cosmic\nLesson",shade:true}, "9d":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "Jc":{label:"Pluto",healer:true}, "Qs":{label:"Neptune",healer:true} },
    },
    specialCards: {},
  },
  // ── Spades ─────────────────────────────────────────────────────────────
  "2s": {
    headerHighlights: {
      "Ks":{label:"Neptune",healer:true}, "8d":{label:"Uranus"}, "10c":{label:"Saturn"},
    },
    topRowHighlights: {
      "10s":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "Qc":{sublabel:"Cosmic\nLesson",shade:true},
      "Ac":{sublabel:"Cosmic\nResult",shade:true,healer:true},
      "3h":{label:"Pluto",healer:true},
    },
    highlights: {
      5: { "Qh":{label:"Jupiter"}, "6s":{label:"Mars",healer:true}, "6c":{label:"Venus"}, "8h":{label:"Mercury"}, "2s":{label:"Birthcard",healer:true}, "4d":{label:"Moon"} },
    },
    specialCards: {},
  },
  "3s": {
    highlights: {
      3: { "5d":{label:"Mars",healer:true}, "7c":{label:"Venus"}, "9h":{label:"Mercury"}, "3s":{label:"Birthcard",healer:true}, "3c":{label:"Moon"} },
      4: { "Jd":{sublabel:"Cosmic\nLesson",shade:true}, "Kc":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "2c":{label:"Pluto",healer:true}, "7s":{label:"Neptune",healer:true}, "9d":{label:"Uranus",healer:true}, "Jc":{label:"Saturn"}, "Qs":{label:"Jupiter"} },
    },
    specialCards: {
      "4h":{sublabel:"Trans-\nFormed\nSelf",shade:true},
    },
  },
  "4s": {
    highlights: {
      2: { "Ad":{label:"Saturn"}, "Ah":{label:"Jupiter"}, "8s":{label:"Mars",healer:true}, "10d":{label:"Venus"}, "10h":{label:"Mercury"}, "4s":{label:"Birthcard",healer:true}, "6d":{label:"Moon"} },
      3: { "7c":{sublabel:"Trans-\nFormed\nSelf",shade:true}, "9h":{sublabel:"Cosmic\nLesson",shade:true}, "3s":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "3c":{label:"Pluto",healer:true}, "5h":{label:"Neptune",healer:true}, "Qd":{label:"Uranus"} },
    },
    specialCards: {},
  },
  "5s": {
    highlights: {
      0: { "2h":{label:"Jupiter"}, "9s":{label:"Mars",healer:true}, "9c":{label:"Venus"}, "Jh":{label:"Mercury"}, "5s":{label:"Birthcard",healer:true}, "7d":{label:"Moon"} },
      1: { "8c":{sublabel:"Trans-\nFormed\nSelf",shade:true}, "Js":{sublabel:"Cosmic\nLesson",shade:true}, "2d":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "4c":{label:"Pluto",healer:true}, "6h":{label:"Neptune",healer:true}, "Kd":{label:"Uranus"}, "Kh":{label:"Saturn"} },
    },
    specialCards: {},
  },
  "6s": {
    headerHighlights: {
      "Ks":{label:"Jupiter"}, "8d":{label:"Mars",healer:true}, "10c":{label:"Venus"},
    },
    topRowHighlights: {
      "As":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "3d":{sublabel:"Cosmic\nLesson",shade:true},
      "5c":{sublabel:"Cosmic\nResult",shade:true,healer:true},
      "10s":{label:"Pluto",healer:true},
      "Qc":{label:"Neptune",healer:true},
      "Ac":{label:"Uranus"},
      "3h":{label:"Saturn"},
    },
    highlights: {
      5: { "Qh":{label:"Mercury"}, "6s":{label:"Birthcard",healer:true}, "6c":{label:"Moon"} },
    },
    specialCards: {},
  },
  "7s": {
    headerHighlights: {
      "10c":{sublabel:"Trans-\nFormed\nSelf",shade:true},
    },
    highlights: {
      4: { "Jd":{label:"Mars",healer:true}, "Kc":{label:"Venus"}, "2c":{label:"Mercury"}, "7s":{label:"Birthcard",healer:true}, "9d":{label:"Moon"} },
      5: { "Qh":{sublabel:"Cosmic\nLesson",shade:true}, "6s":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "6c":{label:"Pluto",healer:true}, "8h":{label:"Neptune",healer:true}, "2s":{label:"Uranus"}, "4d":{label:"Saturn"}, "4h":{label:"Jupiter"} },
    },
    specialCards: {},
  },
  "8s": {
    highlights: {
      2: { "Ad":{label:"Venus"}, "Ah":{label:"Mercury"}, "8s":{label:"Birthcard",healer:true}, "10d":{label:"Moon"} },
      3: { "5d":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "7c":{label:"Pluto",healer:true}, "9h":{label:"Neptune",healer:true}, "3s":{label:"Uranus"}, "3c":{label:"Saturn"}, "5h":{label:"Jupiter"}, "Qd":{label:"Mars",healer:true} },
    },
    specialCards: {
      "Jc":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "Qs":{sublabel:"Cosmic\nLesson",shade:true},
    },
  },
  "9s": {
    highlights: {
      0: { "2h":{label:"Mercury"}, "9s":{label:"Birthcard",healer:true}, "9c":{label:"Moon"} },
      1: { "8c":{label:"Pluto",healer:true}, "Js":{label:"Neptune",healer:true}, "2d":{label:"Uranus"}, "4c":{label:"Saturn"}, "6h":{label:"Jupiter"}, "Kd":{label:"Mars",healer:true}, "Kh":{label:"Venus"} },
    },
    specialCards: {
      "10h":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "4s":{sublabel:"Cosmic\nLesson",shade:true},
      "6d":{sublabel:"Cosmic\nResult",shade:true,healer:true},
    },
  },
  "10s": {
    topRowHighlights: {
      "As":{label:"Mars",healer:true}, "3d":{label:"Venus"}, "5c":{label:"Mercury"}, "10s":{label:"Birthcard",healer:true}, "Qc":{label:"Moon"},
    },
    highlights: {
      0: { "2h":{sublabel:"Cosmic\nLesson",shade:true}, "9s":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "9c":{label:"Pluto",healer:true}, "Jh":{label:"Neptune",healer:true}, "5s":{label:"Uranus"}, "7d":{label:"Saturn"}, "7h":{label:"Jupiter"} },
    },
    specialCards: {
      "Kh":{sublabel:"Trans-\nFormed\nSelf",shade:true},
    },
  },
  "As": {
    topRowHighlights: {
      "As":{label:"Birthcard",healer:true}, "3d":{label:"Moon"},
    },
    highlights: {
      0: { "2h":{label:"Neptune",healer:true}, "9s":{label:"Uranus"}, "9c":{label:"Saturn"}, "Jh":{label:"Jupiter"}, "5s":{label:"Mars",healer:true}, "7d":{label:"Venus"}, "7h":{label:"Mercury"} },
      1: { "4c":{sublabel:"Trans-\nFormed\nSelf",shade:true}, "6h":{sublabel:"Cosmic\nLesson",shade:true}, "Kd":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "Kh":{label:"Pluto",healer:true} },
    },
    specialCards: {},
  },
  "Js": {
    highlights: {
      1: { "8c":{label:"Mercury"}, "Js":{label:"Birthcard",healer:true}, "2d":{label:"Moon"} },
      2: { "Ad":{label:"Pluto",healer:true}, "Ah":{label:"Neptune",healer:true}, "8s":{label:"Uranus"}, "10d":{label:"Saturn"}, "10h":{label:"Jupiter"}, "4s":{label:"Mars",healer:true}, "6d":{label:"Venus"} },
    },
    specialCards: {
      "3c":{sublabel:"Trans-\nFormed\nSelf",shade:true},
      "5h":{sublabel:"Cosmic\nLesson",shade:true},
      "Qd":{sublabel:"Cosmic\nResult",shade:true,healer:true},
    },
  },
  "Ks": {
    headerHighlights: {
      "Ks":{label:"Birthcard",healer:true}, "8d":{label:"Moon"},
    },
    topRowHighlights: {
      "As":{label:"Neptune"}, "3d":{label:"Uranus"}, "5c":{label:"Saturn"},
      "10s":{label:"Jupiter"}, "Qc":{label:"Mars",healer:true}, "Ac":{label:"Venus"}, "3h":{label:"Mercury"},
    },
    highlights: {
      0: { "Jh":{sublabel:"Trans-\nFormed\nSelf",shade:true}, "5s":{sublabel:"Cosmic\nLesson",shade:true}, "7d":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "7h":{label:"Pluto",healer:true} },
    },
    specialCards: {},
  },
  "Qs": {
    highlights: {
      3: { "5d":{label:"Moon"} },
      4: { "Jd":{label:"Uranus"}, "Kc":{label:"Saturn"}, "2c":{label:"Jupiter"}, "7s":{label:"Mars",healer:true}, "9d":{label:"Venus"}, "Jc":{label:"Mercury"}, "Qs":{label:"Birthcard",healer:true} },
      5: { "6c":{sublabel:"Trans-\nFormed\nSelf",shade:true}, "8h":{sublabel:"Cosmic\nLesson",shade:true}, "2s":{sublabel:"Cosmic\nResult",shade:true,healer:true}, "4d":{label:"Pluto",healer:true}, "4h":{label:"Neptune",healer:true} },
    },
    specialCards: {},
  },
};

function Constellations() {
  const cons = [
    { cls:'cn1', vb:'0 0 125 55', w:125, h:55,
      // Cassiopeia W
      stars:[[5,45],[38,8],[65,35],[92,8],[120,40]],
      lines:[[0,1],[1,2],[2,3],[3,4]] },
    { cls:'cn2', vb:'0 0 150 75', w:150, h:75,
      // Big Dipper
      stars:[[0,58],[32,42],[62,38],[85,22],[105,5],[118,22],[112,46]],
      lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]] },
    { cls:'cn3', vb:'0 0 80 105', w:80, h:105,
      // Scorpius hook
      stars:[[42,5],[34,22],[24,42],[16,60],[18,80],[30,92],[48,88]],
      lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]] },
    { cls:'cn4', vb:'0 0 95 75', w:95, h:75,
      // Leo sickle
      stars:[[48,5],[30,18],[14,40],[26,58],[48,50],[64,32]],
      lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]] },
  ];
  return (
    <>
      {cons.map((d, di) => (
        <svg key={di} className={`con ${d.cls}`} viewBox={d.vb} width={d.w} height={d.h} xmlns="http://www.w3.org/2000/svg">
          {d.lines.map(([a,b],i) => (
            <line key={i} x1={d.stars[a][0]} y1={d.stars[a][1]}
              x2={d.stars[b][0]} y2={d.stars[b][1]}
              stroke="rgba(135,206,235,0.28)" strokeWidth="0.8"/>
          ))}
          {d.stars.map(([x,y],i) => (
            <circle key={i} cx={x} cy={y} r={i%3===0?2.3:1.7}
              fill="#87CEEB" className={`cstar cs${i%4}`}/>
          ))}
        </svg>
      ))}
    </>
  );
}

function Stars() {
  const stars = [...Array(55)].map((_, i) => ({
    left: `${(i * 17 + 3) % 98}%`,
    top:  `${(i * 23 + 7) % 95}%`,
    size: `${1 + (i % 3) * 0.7}px`,
    delay: `${(i * 0.31) % 6}s`,
    dur:   `${2.5 + (i % 5) * 0.8}s`,
    op:    0.3 + (i % 4) * 0.18,
  }));
  return (
    <div className="stars-layer">
      {stars.map((s, i) => (
        <div key={i} className={`star star-t${i % 3}`} style={{
          left: s.left, top: s.top,
          width: s.size, height: s.size,
          animationDelay: s.delay, animationDuration: s.dur,
          '--op': s.op,
        }} />
      ))}
    </div>
  );
}

function NightArt() {
  const seedCenters = [[100,66],[129,83],[129,117],[100,134],[71,117],[71,83]];
  const moonPhases = [
    { cls:'nm1', shadow:'M15,3 A12,12 0 0,0 15,27 A8,12 0 0,1 15,3' },
    { cls:'nm2', shadow:'M15,3 A12,12 0 0,0 15,27 L15,3' },
    { cls:'nm3', full:true },
    { cls:'nm4', shadow:'M15,3 A12,12 0 0,1 15,27 A8,12 0 0,0 15,3' },
  ];
  return (
    <>
      {/* Seed of Life — bottom-left corner, partially off-screen */}
      <svg className="bg-art na-sg1" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <g className="na-rot">
          <circle cx="100" cy="100" r="34" fill="none" stroke="rgba(244,200,66,.2)" strokeWidth=".9"/>
          {seedCenters.map(([cx,cy],i)=>(
            <circle key={i} cx={cx} cy={cy} r="34" fill="none" stroke="rgba(244,200,66,.14)" strokeWidth=".8"/>
          ))}
          <circle cx="100" cy="100" r="68" fill="none" stroke="rgba(244,200,66,.09)" strokeWidth=".7"/>
          <circle cx="100" cy="100" r="100" fill="none" stroke="rgba(244,200,66,.05)" strokeWidth=".6"/>
        </g>
      </svg>

      {/* Star tetrahedron — top-right corner, partially off-screen */}
      <svg className="bg-art na-sg2" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
        <g className="na-rot-rev">
          <circle cx="90" cy="90" r="78" fill="none" stroke="rgba(180,100,255,.1)" strokeWidth=".7"/>
          <circle cx="90" cy="90" r="50" fill="none" stroke="rgba(244,200,66,.12)" strokeWidth=".7"/>
          <circle cx="90" cy="90" r="24" fill="none" stroke="rgba(244,200,66,.18)" strokeWidth=".9"/>
          <polygon points="90,12 157,135 23,135" fill="none" stroke="rgba(244,200,66,.14)" strokeWidth=".9"/>
          <polygon points="90,168 157,45 23,45" fill="none" stroke="rgba(244,200,66,.14)" strokeWidth=".9"/>
          {[...Array(12)].map((_,i)=>{
            const a=i*30*Math.PI/180;
            return <line key={i} x1={90+78*Math.sin(a)} y1={90-78*Math.cos(a)} x2={90+50*Math.sin(a)} y2={90-50*Math.cos(a)} stroke="rgba(244,200,66,.07)" strokeWidth=".6"/>;
          })}
        </g>
      </svg>

      {/* Moon phases — right side, scattered vertically */}
      {moonPhases.map(({cls,shadow,full})=>(
        <svg key={cls} className={`bg-art na-moon ${cls}`} viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15" cy="15" r="12" fill={full?'rgba(244,200,66,.14)':'none'} stroke="rgba(244,200,66,.4)" strokeWidth="1"/>
          {shadow && <path d={shadow} fill="rgba(244,200,66,.13)"/>}
        </svg>
      ))}

      {/* 8-pointed star glyphs — bottom-right edge */}
      <svg className="bg-art na-star1" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
        {[0,45,90,135].map(a=>{
          const r=a*Math.PI/180;
          return <line key={a} x1={22+19*Math.sin(r)} y1={22-19*Math.cos(r)} x2={22-19*Math.sin(r)} y2={22+19*Math.cos(r)} stroke="rgba(244,200,66,.55)" strokeWidth="1.2"/>;
        })}
        <circle cx="22" cy="22" r="3.5" fill="rgba(244,200,66,.75)"/>
      </svg>
      <svg className="bg-art na-star2" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        {[0,45,90,135].map(a=>{
          const r=a*Math.PI/180;
          return <line key={a} x1={18+15*Math.sin(r)} y1={18-15*Math.cos(r)} x2={18-15*Math.sin(r)} y2={18+15*Math.cos(r)} stroke="rgba(180,100,255,.5)" strokeWidth="1"/>;
        })}
        <circle cx="18" cy="18" r="3" fill="rgba(180,100,255,.65)"/>
      </svg>
    </>
  );
}

function DayArt() {
  const flowerAngles = [0,72,144,216,288];
  return (
    <>
      {/* Botanical branch — bottom-left corner */}
      <svg className="bg-art da-bot1" viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg">
        <path d="M10,180 Q40,145 70,110 Q105,72 135,45" fill="none" stroke="rgba(139,90,43,.32)" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M40,150 Q24,136 16,120" fill="none" stroke="rgba(139,90,43,.22)" strokeWidth="1" strokeLinecap="round"/>
        <path d="M70,110 Q56,94 50,76" fill="none" stroke="rgba(139,90,43,.2)" strokeWidth="1" strokeLinecap="round"/>
        <path d="M100,82 Q84,68 82,52" fill="none" stroke="rgba(139,90,43,.2)" strokeWidth="1" strokeLinecap="round"/>
        <ellipse cx="36" cy="138" rx="16" ry="7" fill="rgba(100,128,55,.22)" stroke="rgba(78,108,35,.3)" strokeWidth=".8" transform="rotate(-40 36 138)"/>
        <ellipse cx="64" cy="110" rx="15" ry="6.5" fill="rgba(100,128,55,.2)" stroke="rgba(78,108,35,.28)" strokeWidth=".8" transform="rotate(-55 64 110)"/>
        <ellipse cx="95" cy="82" rx="14" ry="6" fill="rgba(100,128,55,.2)" stroke="rgba(78,108,35,.28)" strokeWidth=".8" transform="rotate(-65 95 82)"/>
        <ellipse cx="122" cy="57" rx="13" ry="5.5" fill="rgba(100,128,55,.18)" stroke="rgba(78,108,35,.26)" strokeWidth=".8" transform="rotate(-68 122 57)"/>
        {flowerAngles.map(a=>{
          const rad=a*Math.PI/180, cx=135+9*Math.sin(rad), cy=45-9*Math.cos(rad);
          return <ellipse key={a} cx={cx} cy={cy} rx="5" ry="3" fill="rgba(212,168,32,.3)" stroke="rgba(180,130,20,.35)" strokeWidth=".7" transform={`rotate(${a+90} ${cx} ${cy})`}/>;
        })}
        <circle cx="135" cy="45" r="4" fill="rgba(212,168,32,.5)"/>
        <circle cx="135" cy="45" r="1.5" fill="rgba(255,220,80,.7)"/>
      </svg>

      {/* Botanical branch mirrored — bottom-right corner */}
      <svg className="bg-art da-bot2" viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg">
        <path d="M190,180 Q160,145 130,110 Q95,72 65,45" fill="none" stroke="rgba(139,90,43,.32)" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M160,150 Q176,136 184,120" fill="none" stroke="rgba(139,90,43,.22)" strokeWidth="1" strokeLinecap="round"/>
        <path d="M130,110 Q144,94 150,76" fill="none" stroke="rgba(139,90,43,.2)" strokeWidth="1" strokeLinecap="round"/>
        <path d="M100,82 Q116,68 118,52" fill="none" stroke="rgba(139,90,43,.2)" strokeWidth="1" strokeLinecap="round"/>
        <ellipse cx="164" cy="138" rx="16" ry="7" fill="rgba(100,128,55,.22)" stroke="rgba(78,108,35,.3)" strokeWidth=".8" transform="rotate(40 164 138)"/>
        <ellipse cx="136" cy="110" rx="15" ry="6.5" fill="rgba(100,128,55,.2)" stroke="rgba(78,108,35,.28)" strokeWidth=".8" transform="rotate(55 136 110)"/>
        <ellipse cx="105" cy="82" rx="14" ry="6" fill="rgba(100,128,55,.2)" stroke="rgba(78,108,35,.28)" strokeWidth=".8" transform="rotate(65 105 82)"/>
        <ellipse cx="78" cy="57" rx="13" ry="5.5" fill="rgba(100,128,55,.18)" stroke="rgba(78,108,35,.26)" strokeWidth=".8" transform="rotate(68 78 57)"/>
        {flowerAngles.map(a=>{
          const rad=a*Math.PI/180, cx=65+9*Math.sin(rad), cy=45-9*Math.cos(rad);
          return <ellipse key={a} cx={cx} cy={cy} rx="5" ry="3" fill="rgba(212,168,32,.3)" stroke="rgba(180,130,20,.35)" strokeWidth=".7" transform={`rotate(${a+90} ${cx} ${cy})`}/>;
        })}
        <circle cx="65" cy="45" r="4" fill="rgba(212,168,32,.5)"/>
        <circle cx="65" cy="45" r="1.5" fill="rgba(255,220,80,.7)"/>
      </svg>

      {/* Golden ratio spiral — lower-right edge */}
      <svg className="bg-art da-spiral" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
        <path d="M80,80 A34,34 0 0,1 114,80 A55,55 0 0,1 80,135 A89,89 0 0,1 -9,80 A144,144 0 0,1 80,-64" fill="none" stroke="rgba(212,168,32,.28)" strokeWidth="1.3"/>
        <circle cx="80" cy="80" r="2.5" fill="rgba(212,168,32,.5)"/>
      </svg>

      {/* Sun mandala — top-center */}
      <svg className="bg-art da-sun" viewBox="0 0 88 88" xmlns="http://www.w3.org/2000/svg">
        <circle cx="44" cy="44" r="16" fill="none" stroke="rgba(212,168,32,.38)" strokeWidth="1.1"/>
        <circle cx="44" cy="44" r="8" fill="rgba(212,168,32,.18)"/>
        {[...Array(12)].map((_,i)=>{
          const a=i*30*Math.PI/180, r1=19, r2=i%3===0?27:23;
          return <line key={i} x1={44+r1*Math.sin(a)} y1={44-r1*Math.cos(a)} x2={44+r2*Math.sin(a)} y2={44-r2*Math.cos(a)} stroke="rgba(212,168,32,.4)" strokeWidth={i%3===0?1.2:.9}/>;
        })}
        <circle cx="44" cy="44" r="3" fill="rgba(212,168,32,.5)"/>
      </svg>
    </>
  );
}

function Fireflies() {
  const flies = [...Array(12)].map((_, i) => ({
    left: `${(i * 31 + 8) % 88}%`,
    top:  `${(i * 19 + 12) % 82}%`,
    size: `${4 + (i % 3) * 2}px`,
    delay: `${(i * 0.9) % 8}s`,
    dur:   `${6 + (i % 4) * 2}s`,
    dx: `${(i % 2 === 0 ? 1 : -1) * (10 + (i % 3) * 8)}px`,
    dy: `${(i % 3 === 0 ? -1 : 1) * (8 + (i % 4) * 6)}px`,
  }));
  return (
    <div className="fireflies-layer">
      {flies.map((f, i) => (
        <div key={i} className="firefly" style={{
          left: f.left, top: f.top,
          width: f.size, height: f.size,
          animationDelay: f.delay, animationDuration: f.dur,
          '--dx': f.dx, '--dy': f.dy,
        }} />
      ))}
    </div>
  );
}

function CardCell({ cardStr, label, highlight, healer, small, onClick, selected, day, sublabel, shade }) {
  const card = parseCard(cardStr, day);
  if (!card) return <div />;
  return (
    <div
      className={["card-cell", highlight?"hl":"", healer?"hlr":"", small?"sm":"", selected?"sel":"", shade?"shd":""].filter(Boolean).join(" ")}
      onClick={() => onClick && onClick(cardStr)}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {healer && <div className="htag">Healer's Code</div>}
      <div className="cv" style={{ color: card.color }}>{card.value}<span>{card.symbol}</span></div>
      {label && <div className="cl">{label}</div>}
      {sublabel && <div className="sl">{sublabel}</div>}
    </div>
  );
}

const MYSTERY_MSGS = [
  "Welcome to your chart. These qualities and more reveal and acknowledge who you were born to be.",
  "This is only the beginning. You're here because you are ready to celebrate who you are. Whether you feel like you express these things masterfully or have grown into this in some way and aren't sure how to share it...",
  "Even that is part of the thrill ride you're ready to live just by being here. Everything before has led you here to begin discovering the mystery and magic of life in ways you've always sensed & more.",
  "Welcome to a micro step that in the Universe's Eyes is always a leap! Welcome Beloved One. Welcome. You were born to heal.",
  "Enjoy this map that has no limits to what it may reveal or how far it can expand... a map that begins and lives with and as YOU!",
];

const NUMBER_MESSAGES = [
  { n: '1', startLead: 'Begin noticing.', start: 'Pay attention, something new is revealing itself to you through thoughts, synchronicities, and words spoken through others.', stopLead: 'Stop centering yourself for a moment.', stop: "It's time to take the focus off of you for a moment and focus on something or someone new." },
  { n: '2', startLead: 'Begin connecting.', start: 'Its time to connect with others and the Divine in a more truthful way.', stopLead: 'Stop circling the decision.', stop: "It's time to stop overthinking a relationship and make a decision that honors everyone involved (especially you)." },
  { n: '3', startLead: 'Begin celebrating.', start: 'Celebrate the big and small things unfolding in your life. More is on its way.', stopLead: 'Stop feeding uncertainty.', stop: "It's time to shift focus from fear or uncertainty to immediate creative expression - or anxiety may amplify." },
  { n: '4', startLead: 'Begin building.', start: 'Put time and attention into building a foundation that helps you feel safe, secure, and supported to experience your dreams. You are on path.', stopLead: 'Stop working so hard.', stop: "Stop working so hard. It's okay to rest into what you have created, or who you have become and know that it will be enough for the journey ahead. Change is coming but you are ready." },
  { n: '5', startLead: 'Begin saying yes.', start: "Connect with others, meet new people, and do things you have never done (or haven't done in a while. Change is in the air and you can expect travel, new people, and new experiences to open doors. Say yes to more.", stopLead: 'Stop mistaking freedom for avoidance.', stop: 'Stop overvaluing or prioritizing freedom to the detriment of your success.' },
  { n: '6', startLead: 'Begin choosing higher expression.', start: 'Your purpose is calling you to higher expression. This moment is the fulfillment of a previous dream, but the Universe has more if you are willing to choose it.', stopLead: 'Stop waiting for perfect timing.', stop: 'Stop waiting for the perfect moment to act. Your dreams are calling you now.' },
  { n: '7', startLead: 'Begin the leap.', start: 'Its time for a leap of faith. This is a number that invites bold new actions - but only those that match where you want to take your life. Take a step back and consider the implications...then, leap.', stopLead: 'Stop second-guessing your desire.', stop: 'Interrupt your habit of second-guessing yourself. What you want is valid and worthwhile.' },
  { n: '8', startLead: 'Begin receiving more.', start: 'Its time to welcome more. The frequency of abundance is all around you and ready to increase the returns for everything you are participating in.', stopLead: 'Stop entering power struggles.', stop: 'Ditch any power struggles in relationships. You may be feeling the need to rescue others or stand up to them. Harmony will provide a new approach.' },
  { n: '9', startLead: 'Begin pruning.', start: "Its time to choose between fulfillment or accumulation. Start pruning anything in your life that doesn't match what you have been creating and the Universe will fill that space.", stopLead: 'Stop treating transition like collapse.', stop: "It's time to drop the idea that everything is ending or falling apart. Life wants to fulfill your dreams, not take them away. This too shall pass." },
  { n: '10', startLead: 'Begin speaking.', start: 'Its time to speak up and share your vision. Your leadership skills are being developed.', stopLead: 'Stop doing for others what belongs to them.', stop: 'Stop doing for others what they need to learn to do for themselves. If you are managing people and experiences its time to step back.' },
  { n: '11', startLead: 'Begin waking up.', start: 'Wake up. You are being activated into a new paradigm of awareness.', stopLead: 'Stop looking with old eyes.', stop: 'Its time to look at something happening around you and see it with new eyes. This is a wake up call.' },
];

function NumberMessages({ day, compact=false, mode='both' }) {
  const pages = mode === 'both' ? ['stop', 'start'] : [mode];
  const sectionTitle = mode === 'both' ? 'Stop & Start' : mode === 'stop' ? 'Stop' : 'Start';
  const pageInfo = {
    stop: {
      title: 'What to Stop',
      subtitle: 'Close the leak. Return your energy to what is true.',
      leadKey: 'stopLead',
      bodyKey: 'stop',
    },
    start: {
      title: 'What to Start',
      subtitle: 'Open the door. Follow the first honest signal.',
      leadKey: 'startLead',
      bodyKey: 'start',
    },
  };

  return (
    <div className={`num-msg ${day ? 'day' : 'night'}${compact ? ' compact' : ''} ${mode === 'both' ? 'paired' : 'single'}`}>
      <div className="num-msg-top">
        <div className="num-msg-sigil" aria-hidden="true">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="29" strokeWidth="1" opacity=".38"/>
            <polygon points="40,8 68,58 12,58" strokeWidth="1.15" opacity=".72"/>
            <path d="M16 40 H64 M40 8 L40 58 M24 22 L56 58 M56 22 L24 58" strokeWidth=".9" opacity=".45"/>
            <circle cx="40" cy="40" r="4.5" strokeWidth="1" opacity=".86"/>
          </svg>
        </div>
        <div>
          <div className="num-msg-eyebrow">Messages from the Numbers</div>
          <div className="num-msg-title">{sectionTitle}</div>
          <div className="num-msg-sub">{mode === 'both' ? 'Two companion charts — aligned by number.' : mode === 'stop' ? 'Stop page — first, to clear the path.' : 'Start page — then, to move with clarity.'}</div>
        </div>
      </div>
      <div className="num-msg-pages">
        {pages.map(page => {
          const info = pageInfo[page];
          return (
            <article className={`num-msg-page ${page}`} key={page}>
              <div className="num-msg-page-head">
                <div className="num-msg-page-title">{info.title}</div>
                <div className="num-msg-page-sub">{info.subtitle}</div>
              </div>
              <div className="num-msg-list">
                {NUMBER_MESSAGES.map(item => (
                  <div className="num-msg-row" key={`${page}-${item.n}`}>
                    <div className="num-msg-num">{item.n}</div>
                    <div className="num-msg-copy"><strong>{item[info.leadKey]}</strong>{item[info.bodyKey]}</div>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [coords, setCoords] = useState(loadCoords);
  const [day, setDay] = useState(() => isDaytime(loadCoords()));
  const [greeting, setGreeting] = useState(() => getGreeting(loadCoords()));
  const [selectedCard, setSelectedCard] = useState(null);
  const [birthCard, setBirthCard] = useState(null);
  const [showBCMenu, setShowBCMenu] = useState(false);
  const [dayDeclaration, setDayDeclaration] = useState('');
  const [sparkDismissed, setSparkDismissed] = useState(false);
  useEffect(() => setSparkDismissed(false), [birthCard]);
  const [showMystery, setShowMystery] = useState(false);
  const [mysteryIdx, setMysteryIdx] = useState(0);
  const [mysteryVis, setMysteryVis] = useState(true);
  const [widgetMode, setWidgetMode] = useState(true);
  const [panelIdx, setPanelIdx] = useState(0);
  const [wgtChartOpen, setWgtChartOpen] = useState(false);

  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;
  const isStandalone = typeof window !== 'undefined' && (
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    window.navigator?.standalone === true
  );
  const isMobileShell = !isElectron && (
    isStandalone ||
    window.matchMedia?.('(pointer: coarse)')?.matches ||
    window.matchMedia?.('(max-width: 760px)')?.matches
  );
  const isPWA = !isElectron;

  const goFull = () => {
    if (!isElectron) return;
    setWidgetMode(false);
    window.electronAPI?.goFull();
  };
  const goWidget = () => { setWidgetMode(true); setPanelIdx(0); window.electronAPI?.goWidget(); };

  useEffect(() => {
    const active = showMystery || (widgetMode && panelIdx === 4);
    if (!active) return;
    const cycle = setInterval(() => {
      setMysteryVis(false);
      setTimeout(() => {
        setMysteryIdx(i => (i + 1) % MYSTERY_MSGS.length);
        setMysteryVis(true);
      }, 700);
    }, 10000);
    return () => clearInterval(cycle);
  }, [showMystery, widgetMode, panelIdx]);

  useEffect(() => {
    if (widgetMode && panelIdx === 4) { setMysteryIdx(0); setMysteryVis(true); }
  }, [widgetMode, panelIdx]);

  const lastWheelRef = useRef(0);
  const touchStart = useRef(null);
  const movePanel = (direction) => {
    const now = Date.now();
    if (now - lastWheelRef.current < 350) return;
    lastWheelRef.current = now;
    setPanelIdx(i => direction > 0 ? Math.min(i + 1, 6) : Math.max(i - 1, 0));
  };

  const canSwipeFrom = (target) => {
    if (!target) return true;
    return !target.closest?.('textarea, input, select, button, a, .wgt-chart-scroll, .pn, .bc-pn');
  };

  const startSwipe = (touch, target) => {
    if (selectedCard || !widgetMode || !canSwipeFrom(target)) {
      touchStart.current = null;
      return;
    }
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const finishSwipe = (touch) => {
    if (selectedCard || !touchStart.current) return;
    const deltaY = touchStart.current.y - touch.clientY;
    const deltaX = touchStart.current.x - touch.clientX;
    touchStart.current = null;
    if (!isElectron) {
      if (Math.abs(deltaX) < 34 || Math.abs(deltaX) < Math.abs(deltaY) * 1.05) return;
      movePanel(deltaX > 0 ? 1 : -1);
      return;
    }
    if (Math.abs(deltaY) < 34 || Math.abs(deltaY) < Math.abs(deltaX) * 1.05) return;
    movePanel(deltaY > 0 ? 1 : -1);
  };

  useEffect(() => {
    if (!widgetMode) return;
    const onWheel = e => {
      if (selectedCard) return;
      e.preventDefault();
      movePanel(e.deltaY > 0 ? 1 : -1);
    };
    const onTouchStart = e => startSwipe(e.touches[0], e.target);
    const onTouchMove = e => {
      if (!touchStart.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      const deltaY = touchStart.current.y - touch.clientY;
      const deltaX = touchStart.current.x - touch.clientX;
      const swipeIntent = !isElectron
        ? Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)
        : Math.abs(deltaY) > 8 && Math.abs(deltaY) > Math.abs(deltaX);
      if (swipeIntent && e.cancelable) e.preventDefault();
    };
    const onTouchEnd = e => finishSwipe(e.changedTouches[0]);
    const onPointerDown = e => {
      if (e.pointerType !== 'touch') return;
      startSwipe(e, e.target);
      if (touchStart.current) e.target.setPointerCapture?.(e.pointerId);
    };
    const onPointerUp = e => {
      if (e.pointerType === 'touch') finishSwipe(e);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [widgetMode, selectedCard, isElectron]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(pos => {
      const c = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      localStorage.setItem('lc_coords', JSON.stringify(c));
      setCoords(c);
      setDay(isDaytime(c));
      setGreeting(getGreeting(c));
    });
  }, []);

  useEffect(() => {
    const t = setInterval(() => { setDay(isDaytime(coords)); setGreeting(getGreeting(coords)); }, 60000);
    return () => clearInterval(t);
  }, [coords]);

  const openCard = (cardStr) => { if (READINGS[cardStr]) setSelectedCard(cardStr); };
  const closeCard = () => setSelectedCard(null);
  const reading = selectedCard ? READINGS[selectedCard] : null;
  const rCard = selectedCard ? (selectedCard === 'Jo' ? { value: '★', symbol: '☆', color: day ? '#D4A820' : '#F4C842' } : parseCard(selectedCard, day)) : null;
  const birthChartData = birthCard ? BIRTH_CHARTS[birthCard] : null;
  const activeSpecialCards = birthChartData?.specialCards || SPECIAL_CARDS;
  const activeBCLabels = {};
  if (birthChartData) {
    Object.values(birthChartData.highlights || {}).forEach(rowCells =>
      Object.entries(rowCells).forEach(([card, data]) => {
        if (data.label) activeBCLabels[card] = data.label;
      })
    );
    Object.entries(birthChartData.specialCards || {}).forEach(([card, data]) => {
      if (data.sublabel) activeBCLabels[card] = data.sublabel.replace(/\n/g, ' ');
    });
    Object.entries(birthChartData.headerHighlights || {}).forEach(([card, data]) => {
      activeBCLabels[card] = (data.label || data.sublabel || '').replace(/\n/g, ' ');
    });
    Object.entries(birthChartData.topRowHighlights || {}).forEach(([card, data]) => {
      activeBCLabels[card] = (data.label || data.sublabel || '').replace(/\n/g, ' ');
    });
    if (birthCard === "8d") {
      GRID.header.forEach(item => { if (item.label) activeBCLabels[item.card] = item.label; });
      GRID.topRow.forEach(item => { if (item.label) activeBCLabels[item.card] = item.label; });
    }
  }
  const healerCardsInChart = new Set();
  const allCardsInChart = new Set();
  if (birthChartData) {
    const scan = (obj) => {
      if (!obj) return;
      Object.entries(obj).forEach(([card, data]) => {
        allCardsInChart.add(card);
        if (data.healer) healerCardsInChart.add(card);
      });
    };
    Object.values(birthChartData.highlights || {}).forEach(scan);
    scan(birthChartData.headerHighlights);
    scan(birthChartData.topRowHighlights);
    scan(birthChartData.specialCards);
  }

  const is8dCard = !birthCard || birthCard === "8d";
  const hasTopRowHl = !!(birthChartData?.topRowHighlights && Object.keys(birthChartData.topRowHighlights).length);

  useEffect(() => {
    document.body.classList.toggle('life-chart-pwa', isPWA);
    document.body.classList.toggle('life-chart-mobile-shell', isMobileShell);
    return () => {
      document.body.classList.remove('life-chart-pwa');
      document.body.classList.remove('life-chart-mobile-shell');
    };
  }, [isPWA, isMobileShell]);

  return (
    <div className={`app ${day ? "day" : "night"}${widgetMode ? " wgt" : ""}${isPWA ? " pwa" : ""}${isMobileShell ? " mobile-shell" : ""}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── NIGHT: deep cosmic dark ── */
        .night {
          --bg1: #04030f; --bg2: #0a0820; --bg3: #160830;
          --gold: #F4C842; --goldg: rgba(244,200,66,0.3); --goldf: rgba(244,200,66,0.07);
          --text: #e8dcc8; --textd: rgba(232,220,200,0.4);
          --bdr: rgba(244,200,66,0.18); --bdrf: rgba(244,200,66,0.07);
          --cbg: rgba(255,255,255,0.025); --chov: rgba(244,200,66,0.07);
          --hlbg: rgba(244,200,66,0.1); --pbg: #0a0818;
          --orb: rgba(140,80,255,0.13);
          --togglebg: rgba(0,0,0,0.4);
        }

        /* ── DAY: warm light cream ── */
        .day {
          --bg1: #fdf8ef; --bg2: #faefd8; --bg3: #f5e8c8;
          --gold: #D4A820; --goldg: rgba(212,168,32,0.28); --goldf: rgba(212,168,32,0.08);
          --text: #2a1e08; --textd: rgba(42,30,8,0.45);
          --bdr: rgba(212,168,32,0.24); --bdrf: rgba(212,168,32,0.09);
          --cbg: rgba(255,255,255,0.6); --chov: rgba(212,168,32,0.06);
          --hlbg: rgba(212,168,32,0.09); --pbg: #fefaf2;
          --orb: rgba(255,180,40,0.12);
          --togglebg: rgba(255,255,255,0.6);
        }

        .app {
          min-height: 100vh;
          background: linear-gradient(175deg, var(--bg1) 0%, var(--bg2) 55%, var(--bg3) 100%);
          font-family: 'Cormorant Garamond', serif;
          color: var(--text);
          display: flex; flex-direction: column; align-items: center;
          padding: 2rem 1rem 4rem;
          position: relative; overflow: hidden;
          transition: background 2s ease, color 1.5s ease;
        }

        /* Atmospheric glow center */
        .app::before {
          content: '';
          position: fixed; inset: 0;
          background: radial-gradient(ellipse at 50% 50%, var(--orb) 0%, transparent 65%);
          pointer-events: none; z-index: 0;
          animation: pulse 5s ease-in-out infinite;
        }
        /* Bottom path glow */
        .app::after {
          content: '';
          position: fixed; bottom: 0; left: 50%;
          transform: translateX(-50%);
          width: 80px; height: 55%;
          background: linear-gradient(to top, var(--goldf), transparent);
          clip-path: polygon(38% 100%, 62% 100%, 54% 0%, 46% 0%);
          pointer-events: none; z-index: 0;
          animation: pulse 4s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:.7;} 50%{opacity:1;} }

        /* Particles */
        .particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .p {
          position: absolute; border-radius: 50%;
          animation: floatup ease-in-out infinite;
        }
        .night .p { background: rgba(200,160,255,0.7); box-shadow: 0 0 8px rgba(200,160,255,0.9); }
        .day   .p { background: rgba(220,160,20,0.35); box-shadow: 0 0 6px rgba(220,160,20,0.5); }
        @keyframes floatup { 0%,100%{transform:translateY(0) scale(1);opacity:.5;} 50%{transform:translateY(-20px) scale(1.4);opacity:1;} }

        /* Light rays — form pyramid outline behind header */
        .ray {
          position: fixed; top: 0; left: 50%;
          width: 3px; transform-origin: top center;
          animation: rayshine 7s ease-in-out infinite;
          pointer-events: none; z-index: 0;
        }
        .night .ray { background: linear-gradient(to bottom, rgba(244,200,66,0.85), rgba(180,100,255,0.3), transparent); }
        .day   .ray { background: linear-gradient(to bottom, rgba(138,90,0,0.6), rgba(180,120,0,0.15), transparent); }
        .ray1 { height:38vh; transform:rotate(-22deg); animation-delay:0s; }
        .ray2 { height:33vh; transform:rotate(0deg);   animation-delay:2.5s; }
        .ray3 { height:36vh; transform:rotate(22deg);  animation-delay:5s; }
        @keyframes rayshine { 0%,100%{opacity:.35;} 50%{opacity:.9;} }

        /* Bottom pyramid outline — two edges only, no fill */
        .bot-ray {
          position: fixed; bottom: 0; left: 50%;
          width: 3px; transform-origin: bottom center;
          animation: rayshine 7s ease-in-out infinite;
          pointer-events: none; z-index: 0;
        }
        .night .bot-ray { background: linear-gradient(to top, rgba(244,200,66,0.6), rgba(180,100,255,0.2), transparent); }
        .day   .bot-ray { background: linear-gradient(to top, rgba(138,90,0,0.4), rgba(180,120,0,0.1), transparent); }
        .bot-ray1 { height:35vh; transform:rotate(-22deg); animation-delay:1.2s; }
        .bot-ray2 { height:35vh; transform:rotate(22deg);  animation-delay:3.8s; }

        /* Stars field */
        .stars-layer { position:fixed; inset:0; pointer-events:none; z-index:0; }
        .star { position:absolute; border-radius:50%; transition:opacity 2s; }
        .night .star { background:#fff; animation:twinkle ease-in-out infinite; opacity:var(--op,.4); }
        .day   .star { opacity:0; }
        .star-t0 { box-shadow:0 0 2px rgba(255,255,255,.8); }
        .star-t1 { box-shadow:0 0 3px rgba(200,220,255,.9),0 0 6px rgba(200,220,255,.4); }
        .star-t2 { box-shadow:0 0 2px rgba(255,230,180,.8); }
        @keyframes twinkle {
          0%,100% { opacity:calc(var(--op,.4) * .25); transform:scale(.85); }
          50%      { opacity:var(--op,.4); transform:scale(1.2); }
        }

        /* Fireflies */
        .fireflies-layer { position:fixed; inset:0; pointer-events:none; z-index:0; }
        .firefly { position:absolute; border-radius:50%; transition:opacity 2s; }
        .night .firefly {
          background:radial-gradient(circle, rgba(200,255,140,1) 0%, rgba(160,240,80,.6) 50%, transparent 100%);
          box-shadow:0 0 6px 2px rgba(180,255,100,.7), 0 0 14px 4px rgba(180,255,100,.3);
          animation:fireflyDrift ease-in-out infinite;
        }
        .day .firefly { opacity:0; }
        @keyframes fireflyDrift {
          0%   { opacity:0;   transform:translate(0,0) scale(.7); }
          15%  { opacity:.9;  transform:translate(calc(var(--dx)*.3), calc(var(--dy)*.3)) scale(1); }
          40%  { opacity:.6;  transform:translate(var(--dx), calc(var(--dy)*.6)) scale(.85); }
          65%  { opacity:.85; transform:translate(calc(var(--dx)*.7), var(--dy)) scale(1.1); }
          85%  { opacity:.4;  transform:translate(calc(var(--dx)*.2), calc(var(--dy)*.8)) scale(.9); }
          100% { opacity:0;   transform:translate(0,0) scale(.7); }
        }

        /* Constellations — drifting star patterns in night mode */
        .con  { position:fixed; pointer-events:none; z-index:0; transition:opacity 2.5s ease; }
        .night .con { opacity:.55; }
        .day   .con { opacity:0; }
        .cstar { filter:drop-shadow(0 0 2px #87CEEB) drop-shadow(0 0 5px rgba(135,206,235,.65)); }
        .cs0 { animation:ctwink 4.2s ease-in-out infinite 0s; }
        .cs1 { animation:ctwink 3.7s ease-in-out infinite .8s; }
        .cs2 { animation:ctwink 5.0s ease-in-out infinite 1.5s; }
        .cs3 { animation:ctwink 4.5s ease-in-out infinite 2.3s; }
        @keyframes ctwink { 0%,100%{opacity:.55;} 50%{opacity:1;} }
        .cn1 { top:10%; left:4%;   animation:cdrift1 55s ease-in-out infinite; }
        .cn2 { top:6%;  right:9%;  animation:cdrift2 65s ease-in-out infinite 6s; }
        .cn3 { top:35%; left:6%;   animation:cdrift3 58s ease-in-out infinite 14s; }
        .cn4 { top:22%; right:4%;  animation:cdrift4 50s ease-in-out infinite 10s; }
        @keyframes cdrift1 { 0%,100%{transform:translate(0,0) rotate(0deg);} 50%{transform:translate(14px,-9px) rotate(.5deg);} }
        @keyframes cdrift2 { 0%,100%{transform:translate(0,0) rotate(0deg);} 50%{transform:translate(-12px,11px) rotate(-.4deg);} }
        @keyframes cdrift3 { 0%,100%{transform:translate(0,0) rotate(0deg);} 50%{transform:translate(10px,13px) rotate(.6deg);} }
        @keyframes cdrift4 { 0%,100%{transform:translate(0,0) rotate(0deg);} 50%{transform:translate(-14px,-8px) rotate(-.5deg);} }

        /* ── Background Art — NightArt + DayArt ── */
        .bg-art {
          position: fixed; pointer-events: none; z-index: 0;
          transition: opacity 2s ease;
        }

        /* Sacred geometry — Seed of Life, bottom-left */
        .na-sg1 { bottom: -70px; left: -70px; width: 200px; height: 200px; }
        .night .na-sg1 { opacity: .85; }
        .day   .na-sg1 { opacity: 0; }
        @keyframes na-spin { to { transform: rotate(360deg); } }
        .na-rot { transform-origin: 100px 100px; animation: na-spin 90s linear infinite; }

        /* Star tetrahedron — top-right */
        .na-sg2 { top: -65px; right: -65px; width: 180px; height: 180px; }
        .night .na-sg2 { opacity: .75; }
        .day   .na-sg2 { opacity: 0; }
        @keyframes na-spin-rev { to { transform: rotate(-360deg); } }
        .na-rot-rev { transform-origin: 90px 90px; animation: na-spin-rev 110s linear infinite; }

        /* Moon phases — right side, staggered vertically */
        .na-moon { width: 33px; height: 33px; }
        .night .na-moon { opacity: .85; }
        .day   .na-moon { opacity: 0; }
        .nm1 { right: 6%;  top: 12%; }
        .nm2 { right: 13%; top: 7%; }
        .nm3 { right: 20%; top: 10%; }
        .nm4 { right: 7%;  top: 22%; }

        /* 8-pointed star glyphs — bottom-right */
        .na-star1 { right: 5%;  bottom: 24%; width: 44px; height: 44px; animation: pulse 6s ease-in-out infinite; }
        .na-star2 { right: 11%; bottom: 17%; width: 36px; height: 36px; animation: pulse 8s ease-in-out infinite 2s; }
        .night .na-star1, .night .na-star2 { opacity: .9; }
        .day   .na-star1, .day   .na-star2 { opacity: 0; }

        /* Botanical branches — bottom corners */
        .da-bot1 { bottom: 0; left:  0; width: 200px; height: 180px; }
        .da-bot2 { bottom: 0; right: 0; width: 200px; height: 180px; }
        .day   .da-bot1, .day   .da-bot2 { opacity: .9; }
        .night .da-bot1, .night .da-bot2 { opacity: 0; }

        /* Golden ratio spiral — lower-right edge */
        .da-spiral { bottom: 10%; right: 2%; width: 120px; height: 120px; }
        .day   .da-spiral { opacity: .7; }
        .night .da-spiral { opacity: 0; }

        /* Sun mandala — top-center */
        .da-sun {
          top: -14px; left: 50%; transform: translateX(-50%);
          width: 70px; height: 70px;
          animation: rayshine 9s ease-in-out infinite;
        }
        .day   .da-sun { opacity: .85; }
        .night .da-sun { opacity: 0; }

        /* Toggle */
        .toggle {
          position: fixed; top: 1rem; right: 1rem; z-index: 10;
          font-family: 'Cinzel', serif; font-size: .58rem; letter-spacing: .14em;
          padding: .3rem .7rem; border-radius: 20px;
          border: 1px solid var(--bdr); color: var(--textd);
          background: var(--togglebg); backdrop-filter: blur(10px);
          cursor: pointer; transition: all .3s; text-transform: uppercase;
        }
        .toggle:hover { border-color: var(--gold); color: var(--gold); }

        /* Left widgets column — always fixed, stacks ATC above PK */
        .left-widgets {
          position: fixed; top: 1rem; left: 1rem; z-index: 10;
          display: flex; flex-direction: column; gap: .8rem;
          max-height: calc(100vh - 2rem); overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none;
        }
        .left-widgets::-webkit-scrollbar { display: none; }
        .atc {
          font-family: 'Cormorant Garamond', serif;
          padding: 1.2rem 1.5rem 1.1rem;
          border-radius: 13px;
          width: 295px;
          backdrop-filter: blur(14px);
          transition: background 1.5s ease, border-color 1.5s ease;
          animation: fi 1.2s ease .6s both;
        }
        .atc.day   { background: rgba(253,247,238,.87); border: 1px solid rgba(196,138,56,.28); }
        .atc.night { background: rgba(14,10,24,.83);    border: 1px solid rgba(70,50,110,.55); }
        .atc-ht  { font-family:'Cinzel',serif; font-size:.72rem; font-weight:600; letter-spacing:.11em; text-transform:uppercase; margin:0 0 4px; }
        .atc.day   .atc-ht  { color:#3A2878; }
        .atc.night .atc-ht  { color:#D4CCF0; }
        .atc-nt  { font-size:.55rem; letter-spacing:.09em; text-transform:uppercase; margin:0 0 8px; font-family:'Cinzel',serif; }
        .atc.day   .atc-nt  { color:#C48A38; }
        .atc.night .atc-nt  { color:#C4903A; }
        .atc-rl  { height:1px; width:36px; border-radius:2px; margin:0 0 .75rem; }
        .atc.day   .atc-rl  { background:#C48A38; }
        .atc.night .atc-rl  { background:#9B7ED4; }
        .atc-rw  { display:flex; align-items:baseline; gap:12px; padding:5px 0; border-bottom:1px solid; }
        .atc.day   .atc-rw  { border-color:rgba(230,213,190,.6); }
        .atc.night .atc-rw  { border-color:rgba(33,26,50,.85); }
        .atc-rw:last-of-type { border-bottom:none; }
        .atc-nm  { font-family:'Cinzel',serif; font-size:.6rem; min-width:66px; text-align:right; letter-spacing:.04em; }
        .atc.day   .atc-nm  { color:#9B88B0; }
        .atc.night .atc-nm  { color:#6B5F88; }
        .atc-cn  { font-size:.88rem; font-weight:300; letter-spacing:.02em; }
        .atc.day   .atc-cn  { color:#5448B8; }
        .atc.night .atc-cn  { color:#E0B84A; }
        .atc-ft  { font-style:italic; font-size:.78rem; letter-spacing:.04em; text-align:center; margin-top:.7rem; }
        .atc.day   .atc-ft  { color:#9B88B0; }
        .atc.night .atc-ft  { color:#6B5F88; }
        .atc-your { color:#E8B84B; text-shadow:0 0 6px rgba(255,210,80,.55),0 0 14px rgba(255,200,60,.3),0 0 26px rgba(255,185,40,.18); font-style:normal; }

        /* Messages from the Numbers — between ATC and PK */
        .num-msg {
          font-family:'Cormorant Garamond',serif;
          width:620px; max-width:calc(100vw - 2rem);
          padding:1.25rem 1.35rem 1.25rem;
          border-radius:13px;
          backdrop-filter:blur(14px);
          overflow:hidden; position:relative;
          transition:background 1.5s ease, border-color 1.5s ease;
          animation:fi 1.2s ease .62s both;
        }
        .num-msg.day   { background:rgba(253,247,238,.87); border:1px solid rgba(196,138,56,.28); box-shadow:0 18px 50px rgba(120,84,24,.10); }
        .num-msg.night { background:rgba(14,10,24,.83);    border:1px solid rgba(70,50,110,.55); box-shadow:0 18px 50px rgba(0,0,0,.28); }
        .num-msg::before { content:""; position:absolute; top:-84px; right:-70px; width:190px; height:190px; border-radius:50%; border:1px solid rgba(244,200,66,.11); box-shadow:inset 0 0 0 35px rgba(135,206,235,.022), inset 0 0 0 68px rgba(244,200,66,.022); pointer-events:none; opacity:.8; }
        .num-msg-top { position:relative; display:grid; grid-template-columns:58px 1fr; gap:.85rem; align-items:center; margin-bottom:1rem; min-height:78px; }
        .num-msg-sigil { width:56px; height:56px; border-radius:50%; display:grid; place-items:center; border:1px solid rgba(135,206,235,.24); background:rgba(135,206,235,.035); box-shadow:0 0 22px rgba(135,206,235,.08); }
        .num-msg-sigil svg { width:42px; height:42px; overflow:visible; filter:drop-shadow(0 0 8px rgba(135,206,235,.28)); }
        .num-msg-sigil path, .num-msg-sigil circle, .num-msg-sigil polygon { stroke:#87CEEB; }
        .num-msg.day .num-msg-sigil { border-color:rgba(196,138,56,.24); background:rgba(212,168,32,.045); }
        .num-msg.day .num-msg-sigil path, .num-msg.day .num-msg-sigil circle, .num-msg.day .num-msg-sigil polygon { stroke:#486d88; }
        .num-msg-eyebrow { display:inline-block; font-family:'Cinzel',serif; font-size:.56rem; letter-spacing:.16em; text-transform:uppercase; color:var(--gold); border:1px solid var(--bdr); border-radius:999px; padding:.35rem .6rem .38rem; background:var(--goldf); margin-bottom:.45rem; }
        .num-msg-title { font-family:'Cinzel',serif; font-size:1.5rem; letter-spacing:.12em; text-transform:uppercase; color:var(--text); line-height:1; text-shadow:0 0 18px rgba(244,200,66,.14); }
        .num-msg-sub { margin-top:.35rem; color:var(--textd); font-size:.9rem; font-style:italic; letter-spacing:.025em; }
        .num-msg-pages { position:relative; display:grid; grid-template-columns:1fr 1fr; gap:.85rem; align-items:stretch; }
        .num-msg.single { width:360px; max-width:calc(100vw - 2rem); }
        .num-msg.single .num-msg-pages { grid-template-columns:1fr; }
        .num-msg-page { display:flex; flex-direction:column; min-width:0; }
        .num-msg-page-head { min-height:66px; border:1px solid var(--bdr); border-bottom:0; border-radius:13px 13px 0 0; background:rgba(244,200,66,.04); padding:.8rem .9rem; display:flex; flex-direction:column; justify-content:center; }
        .num-msg-page-title { font-family:'Cinzel',serif; font-size:.78rem; letter-spacing:.14em; text-transform:uppercase; color:var(--text); }
        .num-msg-page-sub { margin-top:.24rem; color:var(--textd); font-size:.78rem; font-style:italic; line-height:1.2; }
        .num-msg-list { border:1px solid var(--bdr); border-radius:0 0 13px 13px; overflow:hidden; background:rgba(255,255,255,.018); flex:1; }
        .num-msg-row { display:grid; grid-template-columns:34px 1fr; min-height:96px; align-items:stretch; border-bottom:1px solid var(--bdrf); }
        .num-msg-row:last-child { border-bottom:0; }
        .num-msg-num { display:grid; place-items:center; border-right:1px solid var(--bdrf); background:rgba(244,200,66,.035); font-family:'Cinzel',serif; font-size:.58rem; letter-spacing:.08em; color:var(--gold); }
        .num-msg-copy { padding:.68rem .78rem .72rem; font-size:.86rem; line-height:1.3; color:var(--text); text-wrap:pretty; background:rgba(255,255,255,.012); }
        .num-msg-copy strong { display:block; font-weight:400; margin-bottom:.12rem; font-size:.9rem; }
        .num-msg-page.start .num-msg-copy strong { color:#87CEEB; text-shadow:0 0 10px rgba(135,206,235,.24); }
        .num-msg.day .num-msg-page.start .num-msg-copy strong { color:#486d88; text-shadow:none; }
        .num-msg-page.stop .num-msg-page-head { border-color:rgba(155,126,212,.28); background:rgba(155,126,212,.055); }
        .num-msg-page.stop .num-msg-num { color:#D4CCF0; }
        .num-msg.day .num-msg-page.stop .num-msg-num { color:#C48A38; }
        .num-msg-page.stop .num-msg-copy strong { color:var(--gold); text-shadow:0 0 10px rgba(244,200,66,.24); }
        .left-widgets .num-msg { width:295px; padding:1.05rem 1.05rem 1rem; border-radius:13px; }
        .left-widgets .num-msg-top { grid-template-columns:44px 1fr; gap:.65rem; min-height:62px; margin-bottom:.75rem; }
        .left-widgets .num-msg-sigil { width:42px; height:42px; }
        .left-widgets .num-msg-sigil svg { width:32px; height:32px; }
        .left-widgets .num-msg-title { font-size:1.05rem; }
        .left-widgets .num-msg-sub { display:none; }
        .left-widgets .num-msg-pages { gap:.55rem; }
        .left-widgets .num-msg-page-head { min-height:56px; padding:.55rem .5rem; }
        .left-widgets .num-msg-page-title { font-size:.55rem; letter-spacing:.1em; }
        .left-widgets .num-msg-page-sub { font-size:.62rem; }
        .left-widgets .num-msg-row { grid-template-columns:24px 1fr; min-height:96px; }
        .left-widgets .num-msg-copy { padding:.48rem .5rem .52rem; font-size:.68rem; line-height:1.18; }
        .left-widgets .num-msg-copy strong { font-size:.7rem; }
        .num-msg.compact { width:100%; height:100%; padding:1rem; overflow-y:auto; scrollbar-width:none; -ms-overflow-style:none; }
        .num-msg.compact::-webkit-scrollbar { display:none; }
        .num-msg.compact .num-msg-top { grid-template-columns:44px 1fr; min-height:68px; margin-bottom:.75rem; }
        .num-msg.compact .num-msg-sigil { width:42px; height:42px; }
        .num-msg.compact .num-msg-sigil svg { width:32px; height:32px; }
        .num-msg.compact .num-msg-title { font-size:1.12rem; }
        .num-msg.compact .num-msg-pages { grid-template-columns:1fr; gap:.55rem; }
        .num-msg.compact .num-msg-page-head { min-height:58px; padding:.58rem .62rem; }
        .num-msg.compact .num-msg-page-title { font-size:.64rem; letter-spacing:.11em; }
        .num-msg.compact .num-msg-page-sub { font-size:.72rem; }
        .num-msg.compact .num-msg-row { grid-template-columns:28px 1fr; min-height:88px; }
        .num-msg.compact .num-msg-copy { padding:.55rem .58rem .6rem; font-size:.75rem; line-height:1.2; }
        .num-msg.compact .num-msg-copy strong { font-size:.78rem; }

        /* Planetary Keywords — stacked below ATC inside left-widgets */
        .pk {
          font-family:'Cormorant Garamond',serif;
          padding:1.2rem 1.5rem 1.1rem;
          border-radius:13px;
          width:295px;
          backdrop-filter:blur(14px);
          transition:background 1.5s ease, border-color 1.5s ease;
          animation:fi 1.2s ease .65s both;
        }
        .pk.day   { background:rgba(253,247,238,.87); border:1px solid rgba(196,138,56,.28); }
        .pk.night { background:rgba(14,10,24,.83);    border:1px solid rgba(70,50,110,.55); }
        .pk-ht  { font-family:'Cinzel',serif; font-size:.72rem; font-weight:600; letter-spacing:.11em; text-transform:uppercase; margin:0 0 4px; }
        .pk.day   .pk-ht { color:#3A2878; }
        .pk.night .pk-ht { color:#D4CCF0; }
        .pk-rl  { height:1px; width:36px; border-radius:2px; margin:0 0 .75rem; }
        .pk.day   .pk-rl { background:#C48A38; }
        .pk.night .pk-rl { background:#9B7ED4; }
        .pk-rw  { display:grid; grid-template-columns:1.4rem 3.8rem 1fr; align-items:start; gap:6px; padding:5px 0; border-bottom:1px solid; }
        .pk.day   .pk-rw { border-color:rgba(230,213,190,.6); }
        .pk.night .pk-rw { border-color:rgba(33,26,50,.85); }
        .pk-rw:last-of-type { border-bottom:none; }
        .pk-sym { font-size:1rem; text-align:center; color:#87CEEB; text-shadow:0 0 8px #87CEEB,0 0 18px rgba(135,206,235,.7),0 0 32px rgba(135,206,235,.4),0 0 50px rgba(255,215,80,.3); animation:planetglow 2.8s ease-in-out infinite; line-height:1.5; }
        .pk-lb  { font-family:'Cinzel',serif; font-size:.62rem; font-weight:600; letter-spacing:.05em; line-height:1.5; padding-top:1px; }
        .pk.day   .pk-lb { color:#5448B8; }
        .pk.night .pk-lb { color:#E0B84A; }
        .pk-kw  { font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-size:.65rem; line-height:1.55; letter-spacing:.01em; }
        .pk.day   .pk-kw { color:#7A6A98; }
        .pk.night .pk-kw { color:#8A7AA8; }

        /* Floating Joker playing card */
        .joker-float { position:absolute; top:-14px; right:108px; transform:rotate(14deg); transform-origin:top center; cursor:pointer; z-index:5; transition:transform .3s ease, filter .3s; }
        .joker-float:hover { transform:rotate(9deg) scale(1.08) translateY(-4px); filter:brightness(1.12); }
        .jpc { display:flex; flex-direction:row; align-items:stretch; width:57px; height:82px; border-radius:6px; border:1.5px solid; overflow:hidden; padding:4px 2px; box-sizing:border-box; gap:2px; }
        .day .jpc { background:#FDF5E4; border-color:#C8A94A; box-shadow:3px 4px 12px rgba(0,0,0,.22); }
        .night .jpc { background:#16102A; border-color:#7B5FB0; box-shadow:3px 4px 16px rgba(0,0,0,.55),0 0 20px rgba(100,70,180,.2); }
        .jpc-side { display:flex; flex-direction:column; align-items:center; justify-content:flex-start; flex-shrink:0; }
        .jpc-r { transform:rotate(180deg); justify-content:flex-start; }
        .jpc-sl { font-family:'Cinzel',Georgia,serif; font-size:6px; font-weight:700; line-height:1.55; display:block; }
        .day .jpc-sl { color:#3A2878; }
        .night .jpc-sl { color:#D4CCF0; }
        .jpc-mid { flex:1; display:flex; align-items:center; justify-content:center; padding:0 1px; }
        .jpc-svg { width:100%; height:auto; }
        .day .jpc-svg { color:#2A1E6A; }
        .night .jpc-svg { color:#C4B5E8; animation:jesterglow 3s ease-in-out infinite; }
        @keyframes jesterglow { 0%,100%{filter:drop-shadow(0 0 2px rgba(135,206,235,.5));opacity:.82;} 50%{filter:drop-shadow(0 0 7px rgba(135,206,235,.9)) drop-shadow(0 0 14px rgba(200,175,80,.45));opacity:1;} }

        /* Header */
        .header { text-align:center; margin-bottom:1.8rem; position:relative; z-index:1; }
        .grt  { font-style:italic; font-size:.88rem; letter-spacing:.12em; margin-bottom:.3rem; animation:fi 1.2s ease; color:#F4C842; text-shadow:0 0 8px rgba(244,200,66,.7), 0 0 20px rgba(244,200,66,.4), 0 0 38px rgba(244,200,66,.2); }
        .bnum { font-family:'Cinzel',serif; font-size:3.8rem; font-weight:600; color:var(--gold); text-shadow:0 0 30px var(--goldg); line-height:1; animation:fi 1.2s ease .15s both; }
        .lt   { font-style:italic; font-size:1.6rem; font-weight:300; animation:fi 1.2s ease .3s both, planetglow 2.8s ease-in-out infinite; color:#55AAEE; text-shadow:0 0 8px #55AAEE, 0 0 20px rgba(85,170,238,.65), 0 0 40px rgba(85,170,238,.35), 0 0 60px rgba(255,215,80,.2); }
        @keyframes fi { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }

        /* Chart */
        .chart { position:relative; z-index:1; width:100%; max-width:650px; animation:fi 1.2s ease .5s both; }

        .hrow  { display:flex; justify-content:center; gap:5px; margin-bottom:5px; }
        .hw    { width:calc(650px / 7); }
        .grid  {
          border:1px solid var(--bdr); border-radius:13px; overflow:hidden;
          background:var(--cbg); backdrop-filter:blur(18px);
          box-shadow:0 8px 40px rgba(0,0,0,.1);
          transition:background 2s, border-color 2s;
        }
        .trow,.grow,.prow { display:grid; grid-template-columns:repeat(7,1fr) 2.6rem; }
        .trow { border-bottom:1px solid var(--bdrf); background:var(--goldf); }
        .trow-plain { background:transparent; }
        .grow { border-bottom:1px solid var(--bdrf); }
        .grow:last-of-type { border-bottom:none; }
        .prow { border-top:1px solid var(--bdrf); background:var(--goldf); }
        .pc   { display:flex; align-items:center; justify-content:center; padding:.5rem .3rem; font-size:.95rem; color:#87CEEB; text-shadow:0 0 8px #87CEEB,0 0 18px rgba(135,206,235,.7),0 0 32px rgba(135,206,235,.4),0 0 55px rgba(255,215,80,.4); animation:planetglow 2.8s ease-in-out infinite; border-right:1px solid var(--bdrf); }
        .pc:last-child { border-right:none; }
        /* Staggered pulse — each planet symbol beats at its own rhythm */
        .grow:nth-child(2) .rpc { animation-duration:2.6s; animation-delay:0s; }
        .grow:nth-child(3) .rpc { animation-duration:3.1s; animation-delay:.5s; }
        .grow:nth-child(4) .rpc { animation-duration:2.4s; animation-delay:1.05s; }
        .grow:nth-child(5) .rpc { animation-duration:3.4s; animation-delay:.3s; }
        .grow:nth-child(6) .rpc { animation-duration:2.9s; animation-delay:.85s; }
        .grow:nth-child(7) .rpc { animation-duration:2.7s; animation-delay:1.4s; }
        .prow .pc:nth-child(1) { animation-duration:3.2s; animation-delay:.2s; }
        .prow .pc:nth-child(2) { animation-duration:2.5s; animation-delay:.7s; }
        .prow .pc:nth-child(3) { animation-duration:3.0s; animation-delay:1.2s; }
        .prow .pc:nth-child(4) { animation-duration:2.7s; animation-delay:.4s; }
        .prow .pc:nth-child(5) { animation-duration:3.3s; animation-delay:.95s; }
        .prow .pc:nth-child(6) { animation-duration:2.6s; animation-delay:1.5s; }
        .prow .pc:nth-child(7) { animation-duration:3.1s; animation-delay:.6s; }
        .rpc  { display:flex; align-items:center; justify-content:center; border-left:1px solid var(--bdrf); font-size:1.3rem; color:#87CEEB; text-shadow:0 0 8px #87CEEB,0 0 18px rgba(135,206,235,.7),0 0 32px rgba(135,206,235,.4),0 0 55px rgba(255,215,80,.4); animation:planetglow 2.8s ease-in-out infinite; }

        .card-cell { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:.48rem .18rem; border-right:1px solid var(--bdrf); position:relative; transition:background .2s, transform .2s; min-height:56px; }
        .card-cell:last-child { border-right:none; }
        .card-cell[style*="pointer"]:hover { background:var(--chov); transform:scale(1.04); }
        .card-cell.sel { background:var(--hlbg); }
        .card-cell.hlr { background:rgba(128,128,128,.03); }
        .card-cell.hl  { background:var(--hlbg); cursor:pointer; }
        .card-cell.hl:hover { filter:brightness(1.05); }
        .card-cell.shd { background:var(--hlbg); }
        .htag { font-family:'Cinzel',serif; font-size:.38rem; letter-spacing:.07em; color:var(--textd); text-transform:uppercase; margin-bottom:2px; text-align:center; }
        .cv   { font-family:'Cinzel',serif; font-size:.95rem; font-weight:600; display:flex; align-items:baseline; gap:1px; line-height:1; transition:color 2s; }
        .sm .cv { font-size:.83rem; }
        .cl   { font-family:'Cinzel',serif; font-size:.38rem; letter-spacing:.1em; color:var(--textd); text-transform:uppercase; margin-top:3px; }
        .sl   { font-family:'Cinzel',serif; font-size:.32rem; letter-spacing:.07em; color:var(--textd); text-transform:uppercase; margin-top:2px; text-align:center; line-height:1.4; white-space:pre-line; }
        .hint { text-align:center; font-style:italic; font-size:.82rem; color:#87CEEB; margin-top:.9rem; letter-spacing:.06em; text-shadow:0 0 10px rgba(135,206,235,.5),0 0 24px rgba(135,206,235,.25); }
        .tagline { background:none; border:none; cursor:pointer; display:block; width:100%; text-align:center; font-family:'Cinzel',serif; font-size:.98rem; font-weight:600; letter-spacing:.06em; margin-top:.45rem; padding:.3rem 0; color:#F4C842; animation:tagpulse 2.6s ease-in-out infinite; }
        .day .tagline { color:#C8920A; animation:tagpulse-day 2.6s ease-in-out infinite; }
        @keyframes tagpulse { 0%,100%{text-shadow:0 0 8px rgba(244,200,66,.5),0 0 20px rgba(244,200,66,.25),0 0 40px rgba(244,200,66,.12);opacity:.88;} 50%{text-shadow:0 0 14px rgba(244,200,66,.9),0 0 32px rgba(244,200,66,.5),0 0 60px rgba(244,200,66,.25);opacity:1;} }
        @keyframes tagpulse-day { 0%,100%{text-shadow:0 0 8px rgba(200,146,10,.45),0 0 20px rgba(200,146,10,.2);opacity:.85;} 50%{text-shadow:0 0 14px rgba(200,146,10,.8),0 0 30px rgba(200,146,10,.4);opacity:1;} }

        /* ✦ glowing star spans — sky-blue pulse with amber outer radiance */
        .sg { display:inline-block; color:#87CEEB; }
        @keyframes planetglow {
          0%   { text-shadow:0 0 3px #87CEEB,0 0 8px rgba(135,206,235,.4),0 0 16px rgba(135,206,235,.2),0 0 28px rgba(255,215,80,.15); opacity:.35; }
          45%  { text-shadow:0 0 16px #87CEEB,0 0 32px rgba(135,206,235,1),0 0 58px rgba(135,206,235,.85),0 0 90px rgba(255,215,80,.65); opacity:1; }
          70%  { text-shadow:0 0 9px #87CEEB,0 0 20px rgba(135,206,235,.75),0 0 36px rgba(135,206,235,.5),0 0 60px rgba(255,215,80,.38); opacity:.72; }
          100% { text-shadow:0 0 3px #87CEEB,0 0 8px rgba(135,206,235,.4),0 0 16px rgba(135,206,235,.2),0 0 28px rgba(255,215,80,.15); opacity:.35; }
        }
        @keyframes starglow {
          0%,100% { text-shadow:0 0 6px #87CEEB,0 0 14px rgba(135,206,235,.75),0 0 26px rgba(135,206,235,.45),0 0 50px rgba(255,215,80,.35); opacity:.88; }
          50%      { text-shadow:0 0 12px #87CEEB,0 0 26px rgba(135,206,235,1),  0 0 46px rgba(135,206,235,.7), 0 0 80px rgba(255,215,80,.55); opacity:1; }
        }
        .night .sg { animation:starglow 2.8s ease-in-out infinite; }
        .day   .sg { animation:starglow 3.2s ease-in-out infinite; }

        /* Card value glows — night glows in suit color; day reflects sky-blue light */
        .night .cv { text-shadow:0 0 12px currentColor, 0 0 5px rgba(255,255,255,.2); }
        .day   .cv { text-shadow:0 0 10px rgba(135,206,235,.7), 0 0 22px rgba(135,206,235,.38), 0 0 40px rgba(255,215,80,.22); }

        /* Birth card selector modal */
        .bc-ov  { position:fixed; inset:0; background:rgba(0,0,0,.52); z-index:500; display:flex; align-items:center; justify-content:center; padding:1rem; backdrop-filter:blur(8px); animation:fi .3s ease; -webkit-app-region:no-drag; }
        .bc-pn  { position:relative; border-radius:17px; border:1px solid; max-width:480px; width:100%; padding:2rem 1.5rem 1.5rem; animation:su .35s ease; box-shadow:0 20px 60px rgba(0,0,0,.35); }
        .day   .bc-pn { background:rgba(253,247,238,.98); border-color:rgba(196,138,56,.35); }
        .night .bc-pn { background:rgba(16,10,26,.98); border-color:rgba(80,55,130,.65); }
        .bc-ttl { font-family:'Cinzel',serif; font-size:1.05rem; font-weight:600; letter-spacing:.12em; text-align:center; color:var(--gold); margin-bottom:1.3rem; }
        .bc-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:.6rem; }
        .bc-col  { display:flex; flex-direction:column; align-items:center; gap:0; }
        .bc-sh   { font-family:'Cinzel',serif; font-size:.6rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; margin-bottom:.5rem; text-align:center; padding-bottom:.3rem; border-bottom:1px solid currentColor; width:100%; }
        .bc-it   { background:none; border:none; cursor:pointer; font-family:'Cinzel',serif; font-size:.78rem; font-weight:600; padding:.22rem .3rem; border-radius:5px; width:100%; text-align:center; transition:background .15s; }
        .day   .bc-it:hover { background:rgba(58,40,120,.08); }
        .night .bc-it:hover { background:rgba(135,206,235,.1); }
        .bc-it.bc-on { outline:1.5px solid currentColor; border-radius:5px; }
        .bc-clr { display:block; margin:1.2rem auto 0; background:none; border:1px solid var(--bdr); color:var(--textd); font-family:'Cinzel',serif; font-size:.65rem; letter-spacing:.12em; text-transform:uppercase; padding:.4rem 1.2rem; border-radius:20px; cursor:pointer; transition:all .2s; }
        .bc-clr:hover { border-color:var(--gold); color:var(--gold); }

        /* Panel */
        .ov  { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:500; display:flex; align-items:center; justify-content:center; padding:1rem; backdrop-filter:blur(7px); animation:fi .3s ease; }
        .ov::-webkit-scrollbar { width:3px; }
        .ov::-webkit-scrollbar-track { background:transparent; }
        .ov::-webkit-scrollbar-thumb { background:rgba(244,200,66,.35); border-radius:2px; }
        .ov::-webkit-scrollbar-thumb:hover { background:rgba(244,200,66,.65); }
        @media (max-height:600px) {
          .ov  { align-items:flex-start; overflow-y:auto; padding:.6rem; }
          .pn  { max-height:none; padding:1.6rem 1.2rem; }
        }
        .pn  { background:var(--pbg); border:1px solid var(--bdr); border-radius:17px; max-width:530px; width:100%; max-height:85vh; overflow-y:auto; padding:2.4rem 1.9rem; position:relative; animation:su .35s ease; box-shadow:0 20px 60px rgba(0,0,0,.2); transition:background 2s; }
        @keyframes su { from{opacity:0;transform:translateY(22px);} to{opacity:1;transform:translateY(0);} }
        .pcl { position:absolute; top:1rem; right:1rem; background:none; border:1px solid var(--bdr); color:var(--textd); width:30px; height:30px; border-radius:50%; cursor:pointer; font-size:.95rem; display:flex; align-items:center; justify-content:center; transition:all .2s; }
        .pcl:hover { border-color:var(--gold); color:var(--gold); }
        .pwa .pcl {
          width:44px; height:44px; font-size:1.35rem;
          background:var(--pbg); box-shadow:0 8px 24px rgba(0,0,0,.28);
        }
        .pi  { font-family:'Cinzel',serif; font-size:2.6rem; color:var(--gold); text-shadow:0 0 22px var(--goldg); text-align:center; margin-bottom:.45rem; }
        .pt  { font-family:'Cinzel',serif; font-size:.88rem; letter-spacing:.12em; color:var(--gold); text-align:center; margin-bottom:.22rem; }
        .ps       { font-style:italic; font-size:1.1rem; color:var(--textd); text-align:center; margin-bottom:.5rem; transition:color .3s; }
        .ps-pulse { font-style:normal; color:#4a90e2; animation:hpulse 2.4s ease-in-out infinite; }
        .ps-grey  { color:rgba(160,160,160,0.3); }
        @keyframes hpulse { 0%,100%{opacity:.65; text-shadow:none;} 50%{opacity:1; text-shadow:0 0 10px rgba(74,144,226,.9),0 0 22px rgba(74,144,226,.45);} }
        .pp  { font-family:'Cinzel',serif; font-size:.6rem; letter-spacing:.14em; color:#87CEEB; text-align:center; margin-bottom:.6rem; text-transform:uppercase; text-shadow:0 0 10px rgba(135,206,235,.6); }
        .dv  { width:55px; height:1px; background:linear-gradient(to right,transparent,var(--gold),transparent); margin:0 auto 1.3rem; }
        .pb  { font-size:1.03rem; line-height:1.9; color:var(--text); font-weight:300; }
        .pb p { margin-bottom:.95rem; }
        .pn::-webkit-scrollbar { width:3px; }
        .pn::-webkit-scrollbar-thumb { background:var(--bdr); border-radius:2px; }

        /* Step Into Your Day with Destiny — right widget */
        .right-widgets {
          position:absolute;
          left:calc(100% + 40px);
          top:50%;
          transform:translateY(-50%);
          z-index:10;
          display:flex; flex-direction:column; gap:.8rem;
        }
        .sitd {
          font-family:'Cormorant Garamond',serif;
          padding:1.2rem 1.5rem 1.1rem;
          border-radius:13px;
          width:265px;
          backdrop-filter:blur(14px);
          transition:background 1.5s ease, border-color 1.5s ease;
          animation:fi 1.2s ease .7s both;
        }
        .sitd.day   { background:rgba(253,247,238,.87); border:1px solid rgba(196,138,56,.28); }
        .sitd.night { background:rgba(14,10,24,.83);    border:1px solid rgba(70,50,110,.55); }
        .sitd-ht  { font-family:'Cinzel',serif; font-size:.72rem; font-weight:600; letter-spacing:.11em; text-transform:uppercase; margin:0 0 2px; }
        .sitd.day   .sitd-ht  { color:#3A2878; }
        .sitd.night .sitd-ht  { color:#D4CCF0; }
        .sitd-sub { font-family:'Cinzel',serif; font-size:.58rem; letter-spacing:.14em; text-transform:uppercase; margin:0 0 .6rem; }
        .sitd.day   .sitd-sub { color:#C48A38; }
        .sitd.night .sitd-sub { color:#9B7ED4; }
        .sitd-rl  { height:1px; width:36px; border-radius:2px; margin:0 0 .75rem; }
        .sitd.day   .sitd-rl  { background:#C48A38; }
        .sitd.night .sitd-rl  { background:#9B7ED4; }
        .sitd-date { font-family:'Cinzel',serif; font-size:.55rem; letter-spacing:.1em; text-transform:uppercase; margin-bottom:.9rem; opacity:.65; }
        .sitd.day   .sitd-date { color:#7A6A98; }
        .sitd.night .sitd-date { color:#C4903A; }
        .sitd-spark { position:relative; font-style:italic; font-size:.82rem; line-height:1.6; margin-bottom:.9rem; padding:.65rem 1.6rem .65rem .8rem; border-radius:8px; border-left:2px solid var(--gold); }
        .sitd.day   .sitd-spark { background:rgba(212,168,32,.08); color:#5448B8; }
        .sitd.night .sitd-spark { background:rgba(244,200,66,.06); color:#E0B84A; }
        .sitd-spark-x { position:absolute; top:.3rem; right:.4rem; background:none; border:none; cursor:pointer; font-size:.8rem; line-height:1; padding:0; opacity:.45; transition:opacity .2s; }
        .sitd.day   .sitd-spark-x { color:#5448B8; }
        .sitd.night .sitd-spark-x { color:#E0B84A; }
        .sitd-spark-x:hover { opacity:1; }
        .sitd-lbl { font-family:'Cinzel',serif; font-size:.52rem; letter-spacing:.1em; text-transform:uppercase; margin-bottom:.45rem; }
        .sitd.day   .sitd-lbl { color:#9B88B0; }
        .sitd.night .sitd-lbl { color:#E0B84A; }
        .sitd-ta  { width:100%; box-sizing:border-box; resize:none; border-radius:8px; padding:.65rem .75rem; font-family:'Cormorant Garamond',serif; font-size:.9rem; line-height:1.7; border:1px solid; outline:none; transition:border-color .2s, background .2s; }
        .sitd.day   .sitd-ta  { background:rgba(255,252,245,.7); border-color:rgba(196,138,56,.3); color:#3A2878; }
        .sitd.night .sitd-ta  { background:rgba(10,8,24,.5); border-color:rgba(70,50,110,.5); color:#E0B84A; }
        .sitd.day   .sitd-ta:focus  { border-color:#C48A38; background:rgba(255,252,245,.95); }
        .sitd.night .sitd-ta:focus  { border-color:#C4903A; background:rgba(10,8,24,.8); }
        .sitd.day   .sitd-ta::placeholder  { color:#C4A87A; }
        .sitd.night .sitd-ta::placeholder  { color:rgba(196,144,58,.45); }
        .sitd-ft  { font-style:italic; font-size:.75rem; letter-spacing:.08em; text-align:center; margin-top:.75rem; }
        .sitd.day   .sitd-ft { color:#9B88B0; opacity:.7; }
        .sitd.night .sitd-ft { color:#F4C842; opacity:1; text-shadow:0 0 8px rgba(244,200,66,.7),0 0 18px rgba(244,200,66,.4),0 0 32px rgba(244,200,66,.2); animation:ftglow 3s ease-in-out infinite; }
        @keyframes ftglow { 0%,100%{opacity:.8; text-shadow:0 0 8px rgba(244,200,66,.6),0 0 18px rgba(244,200,66,.3);} 50%{opacity:1; text-shadow:0 0 10px rgba(244,200,66,.9),0 0 22px rgba(244,200,66,.55),0 0 40px rgba(244,200,66,.25);} }

        /* Dive deeper link — bottom of left-widgets */
        .deeper-link { display:block; width:295px; text-align:center; text-decoration:none; font-family:'Cinzel',serif; font-size:.62rem; letter-spacing:.09em; padding:.7rem 0 .2rem; transition:color .2s; }
        .deeper-link.day   { color:#7A6A98; }
        .deeper-link.night { color:#8A7AA8; }
        .deeper-link.day:hover   { color:#3A2878; }
        .deeper-link.night:hover { color:#D4CCF0; }
        .deeper-here { font-weight:700; letter-spacing:.14em; text-decoration:underline; text-underline-offset:3px; }
        .deeper-link.day   .deeper-here { color:#C48A38; }
        .deeper-link.night .deeper-here { color:#E0B84A; text-shadow:0 0 8px rgba(244,200,66,.5); }

        /* ── Widget mode ────────────────────────────────────── */
        html, body, #root {
          width:100%; min-width:100%; height:100%; min-height:100%;
          margin:0; padding:0; background:#04030f; overflow:hidden;
          overscroll-behavior:none;
          -webkit-text-size-adjust:100%;
        }
        body.life-chart-pwa { position:fixed; inset:0; overflow:hidden; touch-action:none; }
        body.life-chart-mobile-shell {
          width:100vw; height:100vh; height:100dvh;
          padding:0; background:#04030f;
          -webkit-touch-callout:none;
        }
        .app.wgt   { background:transparent !important; }

        .wgt-shell {
          position:fixed; inset:0; border-radius:16px;
          width:100vw; height:100vh; height:100dvh;
          display:flex; flex-direction:column; overflow:hidden;
          border:1px solid var(--bdr);
          touch-action:none; -webkit-user-select:none; user-select:none;
        }
        .night .wgt-shell {
          background:rgba(4,3,15,.91);
          backdrop-filter:blur(28px) saturate(1.4);
          box-shadow:0 14px 44px rgba(0,0,0,.75), 0 0 0 .5px rgba(255,255,255,.05);
        }
        .day .wgt-shell {
          background:rgba(253,248,239,.92);
          backdrop-filter:blur(28px) saturate(1.3);
          box-shadow:0 14px 44px rgba(0,0,0,.22), 0 0 0 .5px rgba(255,255,255,.55);
        }

        .wgt-hdr {
          height:42px; display:flex; align-items:center; justify-content:space-between;
          flex-shrink:0; border-bottom:1px solid var(--bdr); padding:0 4px;
        }
        .wgt-hdr-center { display:flex; flex-direction:column; align-items:center; }
        .wgt-name {
          font-family:'Cinzel',serif; font-size:.6rem; letter-spacing:.24em;
          text-transform:uppercase; line-height:1; cursor:pointer;
          color:#55AAEE;
          text-shadow:0 0 6px #55AAEE, 0 0 14px rgba(85,170,238,.7), 0 0 26px rgba(85,170,238,.4), 0 0 44px rgba(255,215,80,.28);
          animation:planetglow 2.8s ease-in-out infinite;
        }
        .wgt-panel-lbl {
          font-family:'Cinzel',serif; font-size:.46rem; letter-spacing:.14em;
          text-transform:uppercase; color:#E8B84B; font-weight:700; margin-top:2px;
          text-shadow:0 0 6px rgba(255,210,80,.55), 0 0 14px rgba(255,200,60,.3), 0 0 26px rgba(255,185,40,.18);
        }
        .wgt-ctrl {
          background:none; border:none; cursor:pointer; color:var(--text);
          opacity:.32; transition:opacity .2s; padding:5px 9px;
          font-size:.88rem; line-height:1; border-radius:5px;
        }
        .wgt-ctrl:hover { opacity:.85; }
        .wgt-ctrl-spacer { width:36px; height:1px; flex-shrink:0; }

        .wgt-body {
          flex:1; overflow:hidden; display:flex;
          align-items:flex-start; justify-content:center;
          padding:13px 11px;
        }
        .wgt-body .atc,
        .wgt-body .pk  { width:100%; animation:fi .3s ease both; }
        .wgt-body .pk-kw { font-size:.69rem; }
        .wgt-body .sitd { width:100%; animation:fi .3s ease both; }
        .wgt-body .mys-pnl { width:100%; animation:fi .3s ease both; }

        .wgt-chart-panel {
          width:100%; display:flex; flex-direction:column;
          align-items:center; justify-content:center; gap:.7rem;
          cursor:pointer; padding:1.8rem 0; animation:fi .3s ease both;
          position:relative;
        }
        .wgt-chart-glow {
          position:absolute; width:200px; height:200px; border-radius:50%;
          background:var(--orb); filter:blur(45px); pointer-events:none;
        }
        .wgt-birth-card {
          font-family:'Cormorant Garamond',serif; font-size:5.8rem;
          line-height:1; font-weight:300; text-shadow:0 0 32px currentColor;
          animation:pulse 4s ease-in-out infinite; position:relative; z-index:1;
        }
        .wgt-chart-name {
          font-family:'Cinzel',serif; font-size:.62rem; letter-spacing:.2em;
          text-transform:uppercase; color:var(--text); opacity:.65;
          position:relative; z-index:1;
        }
        .wgt-chart-tagline {
          font-family:'Cormorant Garamond',serif; font-size:.9rem;
          font-style:italic; color:var(--gold); opacity:.7;
          position:relative; z-index:1;
        }
        .wgt-chart-cta {
          font-family:'Cinzel',serif; font-size:.72rem; letter-spacing:.16em;
          text-transform:uppercase; color:var(--gold); opacity:.6;
          margin-top:.4rem; transition:opacity .25s; position:relative; z-index:1;
        }
        .wgt-chart-panel:hover .wgt-chart-cta { opacity:1; }

        .wgt-sacred-geo {
          width:118px; height:118px; overflow:visible; position:relative; z-index:1;
          animation:sglow 3s ease-in-out infinite;
        }
        @keyframes sglow {
          0%,100% { filter:drop-shadow(0 0 3px rgba(255,215,80,.38)) drop-shadow(0 0 9px rgba(255,215,80,.18)); opacity:.48; }
          45%     { filter:drop-shadow(0 0 10px rgba(255,215,80,.9)) drop-shadow(0 0 26px rgba(255,215,80,.55)) drop-shadow(0 0 42px rgba(135,206,235,.22)); opacity:1; }
          70%     { filter:drop-shadow(0 0 6px rgba(255,215,80,.65)) drop-shadow(0 0 15px rgba(255,215,80,.33)); opacity:.76; }
        }

        .wgt-chart-scroll { scrollbar-width:none; -ms-overflow-style:none; }
        .wgt-chart-scroll::-webkit-scrollbar { display:none; }
        .wgt-chart-inner .hw { width:calc(100% / 7); }

        .wgt-bc-btn {
          background:none; border:none; cursor:pointer; padding:0;
          font-family:'Cormorant Garamond',serif; font-size:.9rem;
          font-style:italic; color:var(--gold); opacity:.75;
          position:relative; z-index:1; transition:opacity .2s;
          -webkit-app-region:no-drag;
        }
        .wgt-bc-btn:hover { opacity:1; }

        .wgt-chart-back {
          background:none; border:none; cursor:pointer; color:var(--gold);
          font-family:'Cinzel',serif; font-size:.6rem; letter-spacing:.12em;
          text-transform:uppercase; padding:6px 11px 8px; opacity:.55;
          transition:opacity .2s; flex-shrink:0; text-align:left;
        }
        .wgt-chart-back:hover { opacity:1; }

        .wgt-chart-hdr {
          font-family:'Cinzel',serif; font-size:.95rem; letter-spacing:.2em;
          text-transform:uppercase; text-align:center; margin-bottom:7px;
        }
        .night .wgt-chart-hdr { color:#ff9060; animation:chartglow-night 3s ease-in-out infinite; }
        .day   .wgt-chart-hdr { color:#cc4400; animation:chartglow-day   3s ease-in-out infinite; }
        @keyframes chartglow-night {
          0%,100% { opacity:.7; text-shadow:0 0 6px rgba(255,100,30,.4); }
          50%      { opacity:1;  text-shadow:0 0 14px rgba(255,130,50,.95), 0 0 30px rgba(255,80,20,.45); }
        }
        @keyframes chartglow-day {
          0%,100% { opacity:.7; text-shadow:0 0 5px rgba(200,70,0,.3); }
          50%      { opacity:1;  text-shadow:0 0 12px rgba(220,90,10,.85), 0 0 24px rgba(200,60,0,.35); }
        }

        .wgt-dots {
          height:30px; display:flex; align-items:center;
          justify-content:center; gap:9px; flex-shrink:0;
          border-top:1px solid var(--bdr);
        }
        .wgt-dot {
          width:5px; height:5px; border-radius:50%; cursor:pointer;
          background:var(--gold); transition:opacity .3s, transform .3s;
          opacity:.25; transform:scale(.85);
        }
        .wgt-dot.on { opacity:.9; transform:scale(1.4); }

        /* ── PWA / mobile full-screen overrides ── */
        .pwa .wgt-shell {
          border-radius:0; border:none;
          min-height:100vh; min-height:100dvh;
        }
        .pwa .wgt-hdr {
          height:calc(52px + env(safe-area-inset-top));
          padding:env(safe-area-inset-top) 12px 0;
        }
        .pwa .wgt-name { font-size:.9rem; }
        .pwa .wgt-panel-lbl { font-size:.62rem; }
        .pwa .wgt-ctrl { font-size:1.1rem; padding:8px 14px; }
        .pwa .wgt-body { align-items:center; padding:1.5rem 1.2rem; }
        .pwa .wgt-chart-panel { padding:2rem 0; gap:1.2rem; }
        .pwa .wgt-sacred-geo { width:55vw; height:55vw; }
        .pwa .wgt-chart-glow { width:60vw; height:60vw; }
        .pwa .wgt-birth-card { font-size:22vw; }
        .pwa .wgt-chart-name { font-size:.9rem; }
        .pwa .wgt-chart-tagline { font-size:1.15rem; }
        .pwa .wgt-chart-cta { font-size:.88rem; }
        .pwa .wgt-bc-btn { font-size:1.15rem; }
        .pwa .wgt-body .pk-kw { font-size:.82rem; line-height:1.7; }
        .pwa .wgt-dots {
          height:calc(38px + env(safe-area-inset-bottom));
          padding-bottom:env(safe-area-inset-bottom);
          gap:12px;
        }
        .pwa .wgt-dot { width:6px; height:6px; }

        .mobile-shell {
          width:100vw; height:100vh; min-height:100vh;
          height:100dvh; min-height:100dvh;
          padding:0; overflow:hidden;
        }
        .mobile-shell .wgt-shell {
          inset:0;
          width:100vw; height:100vh; min-height:100vh;
          height:100dvh; min-height:100dvh;
          border-radius:0; border:none;
          padding-left:env(safe-area-inset-left);
          padding-right:env(safe-area-inset-right);
          isolation:isolate;
        }
        .mobile-shell .wgt-body {
          min-height:0;
          align-items:center;
          justify-content:center;
          padding:clamp(1rem, 4vh, 2rem) 1rem;
          overscroll-behavior:contain;
          touch-action:none;
        }
        .mobile-shell .wgt-body .atc,
        .mobile-shell .wgt-body .pk,
        .mobile-shell .wgt-body .sitd,
        .mobile-shell .wgt-body .mys-pnl,
        .mobile-shell .wgt-body .num-msg {
          width:min(92vw, 430px);
          min-height:min(68svh, 620px);
          display:flex;
          flex-direction:column;
          justify-content:center;
          padding:clamp(1.45rem, 4.5vh, 2.25rem) clamp(1.25rem, 5vw, 2rem);
        }
        .mobile-shell .atc-ht,
        .mobile-shell .pk-ht,
        .mobile-shell .sitd-ht,
        .mobile-shell .mys-pnl-ht { font-size:.9rem; }
        .mobile-shell .atc-nt,
        .mobile-shell .sitd-sub,
        .mobile-shell .sitd-date { font-size:.68rem; }
        .mobile-shell .atc-rw,
        .mobile-shell .pk-rw { padding:.55rem 0; }
        .mobile-shell .atc-nm { font-size:.72rem; min-width:78px; }
        .mobile-shell .atc-cn { font-size:1.08rem; }
        .mobile-shell .pk-rw { grid-template-columns:1.8rem 4.8rem 1fr; gap:.55rem; }
        .mobile-shell .pk-sym { font-size:1.3rem; }
        .mobile-shell .pk-lb { font-size:.74rem; }
        .mobile-shell .wgt-body .pk-kw { font-size:.9rem; line-height:1.75; }
        .mobile-shell .sitd-lbl { font-size:.64rem; }
        .mobile-shell .sitd-ta { font-size:1.08rem; min-height:9rem; }
        .mobile-shell .sitd-ft,
        .mobile-shell .atc-ft { font-size:.9rem; }
        .mobile-shell .mys-msg { font-size:1.15rem; line-height:1.85; }
        .mobile-shell .wgt-chart-scroll,
        .mobile-shell .pn,
        .mobile-shell .bc-pn {
          touch-action:pan-y;
          -webkit-overflow-scrolling:touch;
        }
        .mobile-shell .chart-open-shell .wgt-hdr { display:none; }
        .mobile-shell .chart-open-shell .wgt-body {
          padding:0;
          align-items:stretch;
          justify-content:stretch;
        }
        .mobile-chart-open {
          width:100%; height:100svh;
          padding:calc(env(safe-area-inset-top) + .55rem) .35rem calc(env(safe-area-inset-bottom) + .4rem);
        }
        .mobile-chart-open .wgt-chart-back {
          position:sticky; top:0; z-index:5;
          align-self:flex-start;
          background:var(--pbg);
          border:1px solid var(--bdr);
          border-radius:999px;
          margin:0 0 .35rem .25rem;
          padding:.55rem .8rem .6rem;
          opacity:.9;
          box-shadow:0 8px 26px rgba(0,0,0,.25);
        }
        .mobile-chart-open .wgt-chart-scroll {
          width:100%; height:100%;
          overflow-y:auto; overflow-x:hidden;
          padding:0 .05rem .75rem;
        }
        .mobile-chart-open .wgt-chart-inner {
          width:100%; transform:none !important;
        }
        .mobile-chart-open .hrow { gap:3px; margin-bottom:3px; }
        .mobile-chart-open .grid { border-radius:10px; }
        .mobile-chart-open .trow,
        .mobile-chart-open .grow,
        .mobile-chart-open .prow { grid-template-columns:repeat(7,1fr) 2rem; }
        .mobile-chart-open .card-cell { min-height:clamp(58px, 8.35svh, 76px); padding:.36rem .08rem; }
        .mobile-chart-open .card-cell.hl,
        .mobile-chart-open .card-cell.shd {
          background:var(--hlbg);
          box-shadow:inset 0 0 0 1px rgba(244,200,66,.22), inset 0 0 18px rgba(244,200,66,.08);
        }
        .mobile-chart-open .card-cell.hlr {
          background:rgba(244,200,66,.06);
          box-shadow:inset 0 0 0 1px rgba(135,206,235,.18), inset 0 0 16px rgba(135,206,235,.06);
        }
        .mobile-chart-open .cv { font-size:clamp(.82rem, 3.2vw, 1rem); }
        .mobile-chart-open .sm .cv { font-size:clamp(.72rem, 2.9vw, .9rem); }
        .mobile-chart-open .htag { font-size:.31rem; letter-spacing:.045em; }
        .mobile-chart-open .cl { font-size:clamp(.35rem, 1.45vw, .42rem); letter-spacing:.055em; font-weight:600; }
        .mobile-chart-open .sl { font-size:clamp(.31rem, 1.22vw, .36rem); line-height:1.22; letter-spacing:.04em; font-weight:600; }
        .mobile-chart-open .rpc,
        .mobile-chart-open .pc { font-size:1rem; padding:.35rem .08rem; }
        @supports (height: 100svh) {
          body.life-chart-mobile-shell,
          .mobile-shell,
          .mobile-shell .wgt-shell { height:100svh; min-height:100svh; }
        }

        .wgt-collapse-btn {
          position:fixed; bottom:1rem; right:1rem; z-index:10;
          font-family:'Cinzel',serif; font-size:.56rem; letter-spacing:.14em;
          padding:.28rem .65rem; border-radius:20px;
          border:1px solid var(--bdr); color:var(--textd);
          background:var(--togglebg); backdrop-filter:blur(10px);
          cursor:pointer; transition:all .3s; text-transform:uppercase;
        }
        .wgt-collapse-btn:hover { border-color:var(--gold); color:var(--gold); }

        /* ── Mystery button ─────────────────────────────────── */
        .mys-btn {
          font-family:'Cinzel',serif;
          width:265px;
          padding:.85rem 1.5rem;
          border-radius:13px;
          cursor:pointer;
          text-align:center;
          backdrop-filter:blur(14px);
          transition:background 1.5s, border-color 1.5s, transform .2s;
        }
        .mys-btn:hover { transform:translateY(-1px); }
        .mys-btn:active { transform:translateY(0); }
        .mys-btn.day {
          background:rgba(253,247,238,.87);
          border:1px solid rgba(196,138,56,.4);
          animation:fi 1.2s ease .9s both, mysdayshine 5s ease-in-out infinite 2s;
        }
        .mys-btn.night {
          background:rgba(14,10,24,.83);
          border:1px solid rgba(140,80,255,.45);
          animation:fi 1.2s ease .9s both, mysnightshine 5s ease-in-out infinite 2s;
        }
        @keyframes mysnightshine {
          0%,100% { box-shadow:0 0 8px rgba(140,80,255,.15), 0 0 0 rgba(244,200,66,0); }
          50%     { box-shadow:0 0 24px rgba(140,80,255,.4), 0 0 45px rgba(244,200,66,.08); }
        }
        @keyframes mysdayshine {
          0%,100% { box-shadow:0 0 6px rgba(212,168,32,.1); }
          50%     { box-shadow:0 0 22px rgba(212,168,32,.32), 0 0 40px rgba(212,168,32,.12); }
        }
        .mys-ttl {
          font-size:.72rem; letter-spacing:.2em; text-transform:uppercase; font-weight:600; margin-bottom:4px;
        }
        .mys-btn.day  .mys-ttl { color:#3A2878; }
        .mys-btn.night .mys-ttl { color:#D4CCF0; }
        .mys-sub {
          font-size:.82rem; letter-spacing:.06em; font-style:italic; font-family:'Cormorant Garamond',serif;
        }
        .mys-btn.day  .mys-sub { color:#9B7ED4; }
        .mys-btn.night .mys-sub { color:#C4903A; }

        /* ── Mystery panel ──────────────────────────────────── */
        .mys-pnl {
          font-family:'Cormorant Garamond',serif;
          width:265px;
          padding:1.2rem 1.5rem 1rem;
          border-radius:13px;
          backdrop-filter:blur(14px);
          transition:background 1.5s, border-color 1.5s;
          animation:fi .5s ease both;
          position:relative;
        }
        .mys-pnl.day   { background:rgba(253,247,238,.87); border:1px solid rgba(196,138,56,.28); }
        .mys-pnl.night { background:rgba(14,10,24,.83);    border:1px solid rgba(140,80,255,.4); }
        .mys-close {
          position:absolute; top:.55rem; right:.8rem;
          font-size:1rem; background:none; border:none; cursor:pointer; opacity:.4; line-height:1; transition:opacity .2s;
        }
        .mys-close:hover { opacity:1; }
        .mys-pnl.day   .mys-close { color:#3A2878; }
        .mys-pnl.night .mys-close { color:#D4CCF0; }
        .mys-pnl-ht {
          font-family:'Cinzel',serif; font-size:.6rem; letter-spacing:.16em; text-transform:uppercase; margin-bottom:.65rem;
        }
        .mys-pnl.day   .mys-pnl-ht { color:#C48A38; }
        .mys-pnl.night .mys-pnl-ht { color:#9B7ED4; }
        .mys-pnl-rl { height:1px; width:36px; border-radius:2px; margin:0 0 .85rem; }
        .mys-pnl.day   .mys-pnl-rl { background:#C48A38; }
        .mys-pnl.night .mys-pnl-rl { background:#9B7ED4; }
        .mys-msg {
          font-size:.95rem; line-height:1.7; font-style:italic;
          transition:opacity .65s ease;
          min-height:6rem;
        }
        .mys-pnl.day   .mys-msg { color:#2a1e08; }
        .mys-pnl.night .mys-msg { color:#e8dcc8; }
        .mys-msg.faded { opacity:0; }
        .mys-dots { display:flex; gap:6px; justify-content:center; margin-top:.9rem; }
        .mys-dot {
          width:5px; height:5px; border-radius:50%; cursor:pointer;
          transition:opacity .4s, transform .4s; opacity:.3; transform:scale(.85);
        }
        .mys-dot.on { opacity:1; transform:scale(1.2); }
        .mys-pnl.day   .mys-dot { background:#C48A38; }
        .mys-pnl.night .mys-dot { background:#9B7ED4; }
      `}</style>

      {widgetMode ? (
        <div className={`wgt-shell${wgtChartOpen ? " chart-open-shell" : ""}`}>
          {/* Draggable header */}
          <div className="wgt-hdr" style={{WebkitAppRegion:'drag'}}>
            {isElectron ? (
              <button className="wgt-ctrl" style={{WebkitAppRegion:'no-drag'}} onClick={() => window.electronAPI?.appQuit()}>×</button>
            ) : (
              <div className="wgt-ctrl-spacer" aria-hidden="true" />
            )}
            <div className="wgt-hdr-center" style={{WebkitAppRegion:'no-drag'}} onClick={goFull}>
              <div className="wgt-name">Life Chart</div>
              <div className="wgt-panel-lbl">The Seed Of Your Soul</div>
            </div>
            <div style={{width:36}} />
          </div>

          {/* Panel body */}
          <div className="wgt-body">
            {panelIdx === 0 && (
              <div className={`atc ${day?"day":"night"}`}>
                <div className="atc-ht">Annual Time Cycles</div>
                <div className="atc-nt">Note: Dec 31 adds 1 day to cycle</div>
                <div className="atc-rl" />
                {[["1 – 52","Awareness"],["53 – 104","Acceptance"],["105 – 156","Choice"],["157 – 208","Activation"],["209 – 260","Acceleration"],["261 – 312","Transmutation"],["313 – 365","Integration"]].map(([r,n]) => (
                  <div key={n} className="atc-rw">
                    <span className="atc-nm">{r}</span>
                    <span className="atc-cn">{n}</span>
                  </div>
                ))}
                <div className="atc-ft">Your Birthday is the First Day of <span className="atc-your">Your</span> Year</div>
              </div>
            )}

            {panelIdx === 1 && (
              <NumberMessages day={day} compact mode="stop" />
            )}

            {panelIdx === 2 && (
              <NumberMessages day={day} compact mode="start" />
            )}

            {panelIdx === 3 && (
              <div className={`pk ${day?"day":"night"}`}>
                <div className="pk-ht">Planetary Keywords</div>
                <div className="pk-rl" />
                {[
                  ["☿","Mercury","Awareness · Thought · Logic"],
                  ["♀","Venus","Acceptance · Beauty · Relationships"],
                  ["♂","Mars","Courage · Passion · Responsibility"],
                  ["♃","Jupiter","Activation · Luck · Expansion"],
                  ["♄","Saturn","Discipline · Accountability · Structure"],
                  ["⛢","Uranus","Transmutation · Change · Independence"],
                  ["♆","Neptune","Integration · Dreams · Vision"],
                ].map(([sym,label,kw]) => (
                  <div key={label} className="pk-rw">
                    <span className="pk-sym">{sym}</span>
                    <span className="pk-lb">{label}</span>
                    <span className="pk-kw">{kw}</span>
                  </div>
                ))}
              </div>
            )}

            {panelIdx === 5 && !wgtChartOpen && (
              <div className="wgt-chart-panel" onClick={() => setWgtChartOpen(true)}>
                <div className="wgt-chart-glow" />
                <svg className="wgt-sacred-geo" viewBox="4 4 92 92" xmlns="http://www.w3.org/2000/svg">
                  {(() => {
                    const D = 14, rc = 7, cx = 50, cy = 50;
                    // 13 Metatron circle centers
                    const centers = [[cx, cy]];
                    for (let i = 0; i < 6; i++) {
                      const a = (i * Math.PI) / 3;
                      centers.push([cx + D * Math.cos(a), cy + D * Math.sin(a)]);
                      centers.push([cx + 2 * D * Math.cos(a), cy + 2 * D * Math.sin(a)]);
                    }
                    // 78 connecting lines
                    const lines = [];
                    for (let i = 0; i < centers.length; i++)
                      for (let j = i + 1; j < centers.length; j++)
                        lines.push([i, j]);
                    // 3 star tetrahedra: inner (R=D, horiz), mid (R=1.5D, upright), outer (R=2D, horiz)
                    const hexDefs = [
                      { R: D,        baseRot: 0,            w: 0.72, op: 0.48 },
                      { R: D * 1.5,  baseRot: -Math.PI / 2, w: 0.88, op: 0.55 },
                      { R: D * 2,    baseRot: 0,            w: 1.08, op: 0.63 },
                    ];
                    const starTris = hexDefs.flatMap(({ R, baseRot, w, op }) =>
                      [0, 1].map(t => ({
                        pts: [0, 1, 2].map(v => {
                          const a = baseRot + (t * Math.PI / 3) + (v * 2 * Math.PI / 3);
                          return [cx + R * Math.cos(a), cy + R * Math.sin(a)];
                        }),
                        w, op,
                      }))
                    );
                    return (<>
                      {/* Layer 1: Metatron cube lines */}
                      {lines.map(([i, j]) => (
                        <line key={`l${i}-${j}`}
                          x1={centers[i][0].toFixed(1)} y1={centers[i][1].toFixed(1)}
                          x2={centers[j][0].toFixed(1)} y2={centers[j][1].toFixed(1)}
                          stroke="var(--gold)" strokeWidth="0.22" opacity="0.15"/>
                      ))}
                      {/* Layer 2: 3 star tetrahedra (6 triangles) */}
                      {starTris.map(({ pts, w, op }, idx) => (
                        <polygon key={`t${idx}`}
                          points={pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
                          fill="rgba(244,200,66,0.04)" stroke="var(--gold)"
                          strokeWidth={w} opacity={op}/>
                      ))}
                      {/* Layer 3: 13 circles on top */}
                      {centers.map(([x, y], i) => (
                        <circle key={`c${i}`} cx={x.toFixed(1)} cy={y.toFixed(1)} r={rc}
                          fill="rgba(244,200,66,0.04)" stroke="var(--gold)"
                          strokeWidth={i === 0 ? 0.95 : 0.62}
                          opacity={i === 0 ? 0.72 : 0.52}/>
                      ))}
                    </>);
                  })()}
                </svg>
                <div className="wgt-chart-hdr">Your Life Chart</div>
                <button className="wgt-bc-btn"
                  onClick={e => { e.stopPropagation(); setShowBCMenu(true); }}>
                  {birthCard
                    ? `${parseCard(birthCard,day)?.value} of ${birthCard.endsWith('h')?'Hearts':birthCard.endsWith('d')?'Diamonds':birthCard.endsWith('c')?'Clubs':'Spades'} ▾`
                    : '✦ Choose your birth card ✦'}
                </button>
                <div className="wgt-chart-cta">✦ Open Full Reading ✦</div>
              </div>
            )}

            {panelIdx === 5 && wgtChartOpen && (
              <div className={isMobileShell ? "mobile-chart-open" : ""} style={{width:'100%',display:'flex',flexDirection:'column',animation:'fi .3s ease both',height:'100%'}}>
                <button className="wgt-chart-back" onClick={() => setWgtChartOpen(false)}>← Back</button>
                <div className="wgt-chart-scroll" style={{flex:1,overflowY:'auto',overflowX:isMobileShell?'hidden':'hidden',position:'relative'}}>
                  <div className="wgt-chart-inner" style={isMobileShell ? {transform:'none',transformOrigin:'top left',width:'100%'} : {transform:'scale(0.80)',transformOrigin:'top left',width:`${100/0.80}%`}}>
                    <div className="hrow">
                      {GRID.header.map(item => {
                        const headerHl = birthChartData?.headerHighlights?.[item.card];
                        return (
                          <div key={item.card} className="hw">
                            <CardCell cardStr={item.card}
                              label={is8dCard ? item.label : headerHl?.label}
                              sublabel={is8dCard ? undefined : headerHl?.sublabel}
                              highlight={is8dCard ? item.highlight : !!headerHl}
                              healer={is8dCard ? item.highlight : headerHl?.healer}
                              shade={is8dCard ? false : !!(headerHl?.shade)}
                              onClick={openCard} day={day} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="grid">
                      <div className={`trow${(birthCard && birthCard !== "8d") ? ' trow-plain' : ''}`}>
                        {GRID.topRow.map(item => {
                          const topHl = birthChartData?.topRowHighlights?.[item.card];
                          return (
                            <CardCell key={item.card} cardStr={item.card}
                              label={is8dCard ? item.label : topHl?.label}
                              sublabel={is8dCard ? undefined : topHl?.sublabel}
                              healer={is8dCard ? item.healer : topHl?.healer}
                              highlight={is8dCard ? false : !!topHl}
                              shade={is8dCard ? false : !!(topHl?.shade)}
                              small day={day} onClick={openCard} />
                          );
                        })}
                        <div className="rpc" />
                      </div>
                      {GRID.rows.map((row, ri) => {
                        const rowHl = birthChartData?.highlights?.[ri];
                        return (
                          <div className="grow" key={ri}>
                            {row.map((c, ci) => {
                              const sp = activeSpecialCards[c];
                              const hl = rowHl?.[c];
                              return <CardCell key={ci} cardStr={c} small day={day}
                                label={hl?.label} sublabel={sp?.sublabel}
                                shade={!!(rowHl?.[c]) || sp?.shade}
                                healer={hl?.healer || sp?.healer}
                                onClick={openCard} />;
                            })}
                            <div className="rpc">{GRID.rowPlanets[ri]}</div>
                          </div>
                        );
                      })}
                      <div className="prow">
                        {GRID.planets.map((p, i) => <div key={i} className="pc">{p}</div>)}
                        <div className="pc" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {panelIdx === 4 && (
              <div className={`mys-pnl ${day?"day":"night"}`}>
                <div className="mys-pnl-ht">✦ The Mystery ✦</div>
                <div className="mys-pnl-rl" />
                <div className={`mys-msg${mysteryVis?'':' faded'}`}>{MYSTERY_MSGS[mysteryIdx]}</div>
                <div className="mys-dots" style={{WebkitAppRegion:'no-drag'}}>
                  {MYSTERY_MSGS.map((_,i) => (
                    <div key={i} className={`mys-dot${i===mysteryIdx?' on':''}`}
                      onClick={() => { setMysteryIdx(i); setMysteryVis(true); }} />
                  ))}
                </div>
              </div>
            )}

            {panelIdx === 6 && (
              <div className={`sitd ${day?"day":"night"}`}>
                <div className="sitd-ht">Step Into Your Day</div>
                <div className="sitd-sub">with Destiny</div>
                <div className="sitd-rl" />
                <div className="sitd-date">{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</div>
                <div className="sitd-lbl">Today I commit to honoring:</div>
                <textarea className="sitd-ta" value={dayDeclaration}
                  onChange={e => setDayDeclaration(e.target.value)} rows={4}
                  placeholder={birthCard==="Ah"?"Today I move first — from love, from knowing, and from a worth I've already earned...":birthCard?"What meaningful actions will express what's alive in me today?":"Choose your birth card to reveal your chart's daily calling..."}
                />
                <div className="sitd-ft">Your word is your calling</div>
              </div>
            )}
          </div>

          {/* Panel nav dots — hidden when in-widget chart is open */}
          {!wgtChartOpen && (
            <div className="wgt-dots" style={{WebkitAppRegion:'no-drag'}}>
              {[0,1,2,3,4,5,6].map(i => (
                <div key={i} className={`wgt-dot${i===panelIdx?' on':''}`} onClick={() => setPanelIdx(i)} />
              ))}
            </div>
          )}
        </div>
      ) : (<>

      {/* Particles */}
      <div className="particles">
        {[...Array(18)].map((_,i) => (
          <div key={i} className="p" style={{
            left:`${5+(i*37)%90}%`, top:`${10+(i*53)%80}%`,
            width:`${2+(i%4)}px`, height:`${2+(i%4)}px`,
            animationDelay:`${(i*0.4)%6}s`, animationDuration:`${4+(i%5)}s`
          }}/>
        ))}
      </div>

      <Stars />
      <Fireflies />
      <Constellations />
      <NightArt />
      <DayArt />

      {/* Light rays */}
      <div className="ray ray1"/><div className="ray ray2"/><div className="ray ray3"/>
      <div className="bot-ray bot-ray1"/><div className="bot-ray bot-ray2"/>
      <div className="bot-ray bot-ray1"/><div className="bot-ray bot-ray2"/>
      <button className="toggle" onClick={() => setDay(d => !d)}>
        {day ? "☀ Day" : "☽ Night"}
      </button>

      <div className="left-widgets">
      <div className={`atc ${day ? "day" : "night"}`}>
        <div className="atc-ht">Annual Time Cycles</div>
        <div className="atc-nt">Note: Dec 31 adds 1 day to cycle</div>
        <div className="atc-rl" />
        {[["1 – 52","Awareness"],["53 – 104","Acceptance"],["105 – 156","Choice"],["157 – 208","Activation"],["209 – 260","Acceleration"],["261 – 312","Transmutation"],["313 – 365","Integration"]].map(([r,n]) => (
          <div key={n} className="atc-rw">
            <span className="atc-nm">{r}</span>
            <span className="atc-cn">{n}</span>
          </div>
        ))}
        <div className="atc-ft">Your Birthday is the First Day of <span className="atc-your">Your</span> Year</div>
      </div>

      <NumberMessages day={day} mode="stop" />
      <NumberMessages day={day} mode="start" />

      <div className={`pk ${day ? "day" : "night"}`}>
        <div className="pk-ht">Planetary Keywords</div>
        <div className="pk-rl" />
        {[
          ["☿","Mercury","Awareness, Thought, Logic, Sudden Impacts, Nervous System, Planning, Foreshadowing"],
          ["♀","Venus","Acceptance, Forgiveness, Relationships, Beauty, Fame, Creativity, Sensuality, Feminine"],
          ["♂","Mars","Self-Responsibility, Courage, Passion, Anger, Determination, Divorce, Contracts, Masculine"],
          ["♃","Jupiter","Activation, Opportunities, Luck, Pleasure, Play, Theology, Spirituality, Travel, Ethics, Morals"],
          ["♄","Saturn","Acceleration, Discipline, Outer Responsibility, Control Patterns, Consequences, Authority, Rules, Accountability, Delays, Limitations"],
          ["⛢","Uranus","Transmutation, Change, Tension, Interruption, Social Connections, Science, Space, Extra-Sensory, Extra-Terrestrial, Independence"],
          ["♆","Neptune","Integration, Dreams, Fantasy, Vision, Theatre, Mysticism, Theosophy, Imagination, Attachment"],
        ].map(([sym, label, keywords]) => (
          <div key={label} className="pk-rw">
            <span className="pk-sym">{sym}</span>
            <span className="pk-lb">{label}</span>
            <span className="pk-kw">{keywords}</span>
          </div>
        ))}
      </div>

      <a className={`deeper-link ${day ? "day" : "night"}`}
         href="https://a.co/d/0bLte6Wt"
         target="_blank" rel="noreferrer">
        Want to dive deeper? Click <span className="deeper-here">HERE</span>
      </a>
      </div>

      <div className="header">
        <div className="grt">{greeting}</div>
        <div className="bnum" style={birthCard ? {color:(day?DAY_COLORS:NIGHT_COLORS)[birthCard.slice(-1)]} : {}}>
          {birthCard ? `${parseCard(birthCard,day)?.value}${parseCard(birthCard,day)?.symbol}` : '8♦'}
        </div>
        <div className="lt">Life Chart</div>
      </div>

      <div className="chart">
        <div className="joker-float" onClick={() => openCard('Jo')} title="The Joker">
          <div className="jpc">
            <div className="jpc-side jpc-l">
              {['J','O','K','E','R'].map(l => <span key={l} className="jpc-sl">{l}</span>)}
            </div>
            <div className="jpc-mid">
              <svg viewBox="0 0 55 102" className="jpc-svg" xmlns="http://www.w3.org/2000/svg">
                <path d="M27 3 Q24 11 22 21 Q27 18 32 21 Q30 11 27 3 Z" fill="currentColor"/>
                <path d="M22 21 Q16 13 10 22 Q16 23 22 26 Z" fill="currentColor"/>
                <path d="M32 21 Q38 13 46 22 Q40 23 32 26 Z" fill="currentColor"/>
                <circle cx="27" cy="3" r="2.5" fill="currentColor"/>
                <circle cx="10" cy="24" r="3.8" fill="currentColor"/>
                <circle cx="46" cy="24" r="3.8" fill="currentColor"/>
                <path d="M18 25 Q27 31 36 25 Q38 34 27 34 Q16 34 18 25 Z" fill="currentColor"/>
                <ellipse cx="27" cy="42" rx="7.5" ry="8.5" fill="currentColor"/>
                <path d="M19 51 Q22 44 27 50 Q32 44 35 51 Q38 63 36 76 L28 72 L27 82 L26 72 L18 76 Q16 63 19 51 Z" fill="currentColor"/>
                <path d="M20 54 Q11 47 5 37" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
                <path d="M34 54 Q42 48 48 40" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
                <circle cx="48" cy="37" r="5" fill="currentColor"/>
                <circle cx="5" cy="34" r="3.5" fill="currentColor"/>
                <path d="M20 76 Q15 86 11 96" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                <path d="M34 76 Q40 84 45 90" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                <path d="M11 96 Q5 100 8 95" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                <path d="M45 90 Q50 93 47 89" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="jpc-side jpc-r">
              {['R','E','K','O','J'].map(l => <span key={l} className="jpc-sl">{l}</span>)}
            </div>
          </div>
        </div>
        <div className="hrow">
          {GRID.header.map(item => {
            const headerHl = birthChartData?.headerHighlights?.[item.card];
            return (
              <div key={item.card} className="hw">
                <CardCell cardStr={item.card}
                  label={is8dCard ? item.label : headerHl?.label}
                  sublabel={is8dCard ? undefined : headerHl?.sublabel}
                  highlight={is8dCard ? item.highlight : !!headerHl}
                  healer={is8dCard ? item.highlight : headerHl?.healer}
                  shade={is8dCard ? false : !!(headerHl?.shade)}
                  onClick={READINGS[item.card] ? () => openCard(item.card) : null}
                  day={day} />
              </div>
            );
          })}
        </div>

        <div className="grid">
          <div className={`trow${(birthCard && birthCard !== "8d") ? ' trow-plain' : ''}`}>
            {GRID.topRow.map(item => {
              const topHl = birthChartData?.topRowHighlights?.[item.card];
              return (
                <CardCell key={item.card} cardStr={item.card}
                  label={is8dCard ? item.label : topHl?.label}
                  sublabel={is8dCard ? undefined : topHl?.sublabel}
                  healer={is8dCard ? item.healer : topHl?.healer}
                  highlight={is8dCard ? false : !!topHl}
                  shade={is8dCard ? false : !!(topHl?.shade)}
                  small day={day}
                  onClick={READINGS[item.card] ? () => openCard(item.card) : null} />
              );
            })}
            <div className="rpc" />
          </div>
          {GRID.rows.map((row, ri) => {
            const rowHl = birthChartData?.highlights?.[ri];
            return (
              <div className="grow" key={ri}>
                {row.map((c, ci) => {
                  const sp = activeSpecialCards[c];
                  const hl = rowHl?.[c];
                  return <CardCell key={ci} cardStr={c} small day={day}
                    label={hl?.label}
                    sublabel={sp?.sublabel}
                    shade={!!(rowHl?.[c]) || sp?.shade}
                    healer={hl?.healer || sp?.healer}
                    onClick={READINGS[c] ? () => openCard(c) : null} />;
                })}
                <div className="rpc">{GRID.rowPlanets[ri]}</div>
              </div>
            );
          })}
          <div className="prow">
            {GRID.planets.map((p, i) => <div key={i} className="pc">{p}</div>)}
            <div className="pc" />
          </div>
        </div>
        <p className="hint"><span className="sg">✦</span> Click Your Cards & Lean In <span className="sg">✦</span></p>
        <button className="tagline" onClick={() => setShowBCMenu(true)}>
          {birthCard
            ? `${parseCard(birthCard,day)?.value}${parseCard(birthCard,day)?.symbol} — Change Your Birth Card`
            : 'Choose Your Birth Card and Reveal Your Chart!'}
        </button>

        <div className="right-widgets">
          <div className={`sitd ${day ? "day" : "night"}`}>
            <div className="sitd-ht">Step Into Your Day</div>
            <div className="sitd-sub">with Destiny</div>
            <div className="sitd-rl" />
            <div className="sitd-date">{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</div>
            {birthCard === "Ah" && !sparkDismissed && (
              <div className="sitd-spark">
                <button className="sitd-spark-x" onClick={() => setSparkDismissed(true)}>×</button>
                "I am the love that acts. I speak what I know. I trust what I've earned."
              </div>
            )}
            <div className="sitd-lbl">Today I commit to honoring:</div>
            <textarea
              className="sitd-ta"
              value={dayDeclaration}
              onChange={e => setDayDeclaration(e.target.value)}
              rows={6}
              placeholder={
                birthCard === "Ah"
                  ? "Today I move first — from love, from knowing, and from a worth I've already earned..."
                  : birthCard
                    ? "What meaningful actions will express what's alive in me today?"
                    : "Choose your birth card to reveal your chart's daily calling..."
              }
            />
            <div className="sitd-ft">Your word is your calling</div>
          </div>

          {/* Mystery button */}
          <button
            className={`mys-btn ${day ? "day" : "night"}`}
            onClick={() => {
              if (!showMystery) { setMysteryIdx(0); setMysteryVis(true); }
              setShowMystery(m => !m);
            }}
          >
            <div className="mys-ttl">✦ The Mystery ✦</div>
            <div className="mys-sub">your code awaits you</div>
          </button>

          {/* Mystery panel */}
          {showMystery && (
            <div className={`mys-pnl ${day ? "day" : "night"}`}>
              <button className="mys-close" onClick={() => setShowMystery(false)}>×</button>
              <div className="mys-pnl-ht">✦ The Mystery ✦</div>
              <div className="mys-pnl-rl" />
              <div className={`mys-msg${mysteryVis ? '' : ' faded'}`}>
                {MYSTERY_MSGS[mysteryIdx]}
              </div>
              <div className="mys-dots">
                {MYSTERY_MSGS.map((_, i) => (
                  <div
                    key={i}
                    className={`mys-dot${i === mysteryIdx ? ' on' : ''}`}
                    onClick={() => { setMysteryIdx(i); setMysteryVis(true); }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <button className="wgt-collapse-btn" onClick={goWidget}>▾ Widget</button>
      </>)}

      {showBCMenu && (
        <div className="bc-ov" onClick={() => setShowBCMenu(false)}>
          <div className="bc-pn" onClick={e => e.stopPropagation()}>
            <button className="pcl" onClick={() => setShowBCMenu(false)}>×</button>
            <div className="bc-ttl">Choose Your Birth Card</div>
            <div className="bc-grid">
              {BC_SUITS.map(s => (
                <div key={s.suit} className="bc-col">
                  <div className="bc-sh" style={{color:(day?DAY_COLORS:NIGHT_COLORS)[s.suit]}}>
                    {s.sym} {s.name}
                  </div>
                  {BC_VALUES.map(v => {
                    const code = v + s.suit;
                    return (
                      <button key={code}
                        className={`bc-it${birthCard===code?' bc-on':''}`}
                        style={{color:(day?DAY_COLORS:NIGHT_COLORS)[s.suit]}}
                        onClick={() => { setBirthCard(code); setShowBCMenu(false); }}>
                        {v}{s.sym}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            {birthCard && (
              <button className="bc-clr" onClick={() => { setBirthCard(null); setShowBCMenu(false); }}>
                Clear Selection
              </button>
            )}
          </div>
        </div>
      )}

      {reading && rCard && (() => {
        const isHealer = healerCardsInChart.has(selectedCard);
        const isInChart = birthCard ? allCardsInChart.has(selectedCard) : false;
        const psClass = `ps${isHealer ? ' ps-pulse' : isInChart ? ' ps-grey' : ''}`;
        const planetLabel = activeBCLabels[selectedCard] || (!birthCard ? CARD_POSITION[selectedCard] : null);
        return (
          <div className="ov" onClick={closeCard}
            style={widgetMode ? {alignItems:'flex-start',overflowY:'auto',padding:isElectron ? '.5rem' : 'calc(env(safe-area-inset-top) + .75rem) .75rem .75rem',WebkitAppRegion:'no-drag'} : {}}>
            <div className="pn" onClick={e => e.stopPropagation()}
              style={widgetMode ? {maxHeight:'none',padding:isElectron ? '1.4rem 1rem' : '4.1rem 1.15rem 1.4rem',width:'100%'} : {}}>
              <button className="pcl" onClick={closeCard}
                style={widgetMode ? (isElectron
                  ? {position:'fixed',top:'.6rem',left:'.6rem',zIndex:601,WebkitAppRegion:'no-drag'}
                  : {position:'fixed',top:'calc(env(safe-area-inset-top) + .8rem)',right:'.9rem',left:'auto',zIndex:601,WebkitAppRegion:'no-drag'}) : {}}>×</button>
              <div className="pi" style={{ color: rCard.color }}>{rCard.value}{rCard.symbol}</div>
              <div className="pt">{reading.title}</div>
              {reading.subtitle && <div className={psClass}>{reading.subtitle}</div>}
              {planetLabel && <div className="pp">{planetLabel}</div>}
              <div className="dv" />
              <div className="pb">
                {reading.body.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
