// angles-data.js — niche-specific competitor angle content + quick wins
// Keyed by Step 2 brand type. 'other' falls back to skincare.

export const NICHE_LABELS = {
  skincare: 'skincare brands',
  beauty: 'beauty brands',
  wellness: 'wellness brands',
  other: 'your category',
}

export const ANGLES = {
  skincare: [
    {
      name: 'The Ingredient Anxiety Gap',
      category: 'Awareness angle',
      description:
        'Most skincare buyers over 35 research ingredients obsessively but can’t connect what they read to what they should buy. Your ads likely speak in benefits ("reduces fine lines") when your audience is searching in ingredients ("niacinamide concentration"). The gap between how they search and how you sell is where revenue hides.',
      hook: '"You know what niacinamide does. So does she. But she can’t find an ad that speaks to what she already knows."',
    },
    {
      name: 'The Routine Stack Conflict',
      category: 'Pain point angle',
      description:
        'Your customer doesn’t buy one product — she buys a routine. And her biggest fear isn’t that your serum won’t work, it’s that it’ll conflict with something she already uses. Addressing the "will this fit my routine?" objection in ad copy is almost never done — but it’s one of the most common concerns in skincare forums.',
      hook: '"She’s not worried your serum doesn’t work. She’s worried it’ll mess up everything else she uses."',
    },
    {
      name: 'The Review Mirror',
      category: 'Social proof angle',
      description:
        'The language in your 4-star reviews (not your 5-star ones) contains the exact objections your ads should be addressing. 4-star reviewers bought, used, and mostly liked — but something held them back. That "something" is your next winning ad angle.',
      hook: '"Your best ad copy isn’t on your website. It’s in the reviews you’ve been ignoring."',
    },
  ],
  beauty: [
    {
      name: 'The Tutorial Gap',
      category: 'Education angle',
      description:
        'Beauty buyers watch tutorials before buying. Your ads show the product; their decision happens in the application. Ads that show the moment of application — not the finished look — convert at higher rates because they match the mental model of "can I actually use this?"',
      hook: '"She doesn’t buy the lipstick. She buys the confidence that she can apply it like the person in the video."',
    },
    {
      name: 'The Shade Anxiety',
      category: 'Objection handling',
      description:
        'For colour cosmetics, the #1 purchase barrier isn’t price — it’s "will this shade work on me?" Most ads show one skin tone. The brands winning right now show the same product on multiple tones in a single ad, because the scroll-stop moment is "that’s MY skin."',
      hook: '"Three shades, one swipe. She stopped scrolling when she saw her skin, not yours."',
    },
    {
      name: 'The Repurchase Trigger',
      category: 'Retention angle',
      description:
        'Most beauty ad spend targets acquisition. But your highest-ROI audience is 60–90 day lapsed buyers. They already trust you — they just forgot. A "running low?" retargeting angle outperforms cold prospecting 3:1 on average.',
      hook: '"She loved it. She finished it. She forgot about it. Your competitors didn’t."',
    },
  ],
  wellness: [
    {
      name: 'The Trust Transfer',
      category: 'Authority angle',
      description:
        'Supplement buyers are the most sceptical audience on Meta. They don’t trust ads — they trust practitioners, papers, and peers. Ads that lead with third-party validation (a practitioner’s recommendation, a cited study, a peer’s testimonial) outperform product-first creative.',
      hook: '"She won’t trust your ad. She’ll trust the naturopath who recommended it in a forum she follows."',
    },
    {
      name: 'The Stack Redundancy',
      category: 'Awareness angle',
      description:
        'Your customer is already taking 4–7 supplements. Her question isn’t "does this work?" — it’s "do I need this on top of what I already take?" Addressing stack redundancy in ad copy is almost never done but is the primary barrier in purchase-consideration forums.',
      hook: '"She’s already taking six things. Convince her yours replaces one of them, not adds to the pile."',
    },
    {
      name: 'The Timing Objection',
      category: 'Practical angle',
      description:
        'Supplements have a compliance problem. "Take twice daily with food" is a lifestyle commitment, not a purchase. Ads that normalise the routine — showing the product next to a coffee, in a gym bag, on a nightstand — convert because they answer the unspoken objection: "will I actually remember to take this?"',
      hook: '"She bought it. She took it for a week. It’s been in the cupboard since March."',
    },
  ],
}

export const QUICK_WINS = {
  skincare:
    'This week: Pull your 10 most recent 4-star reviews. Highlight every sentence where the reviewer says ‘but’ or ‘however.’ Each one is an objection your ads aren’t addressing. Turn the top 3 into ad hooks.',
  beauty:
    'This week: Record a 15-second video of your product being applied — not the finished look, the application itself. Test it as a Stories ad against your current best performer.',
  wellness:
    'This week: Find 3 forum threads where someone asks ‘do I need [your category] if I already take [common supplement]?’ The answers contain your next winning hook.',
}

export function getAngles(brandType) {
  return ANGLES[brandType] || ANGLES.skincare
}

export function getQuickWin(brandType) {
  return QUICK_WINS[brandType] || QUICK_WINS.skincare
}
