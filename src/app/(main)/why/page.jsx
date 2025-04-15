import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function PurposePage() {
  const markdownContent = `
# Thriving parishes evangelize like Jesus with Call - Teach - Send

*By Tim Connors, tim@connors.org*

Jesus didn't build a building, sit inside, and wait for people to come in to teach them for 7 minutes once a week. If he did, none of his first 12 disciples would have entered.

Jesus instead gave us a mission: to love and be loved

And Jesus showed us how to convene to do that loving when he formed the first parish in the Catholic Church with "Call - Teach - Send"

## Call

Jesus started the Church by welcoming 12 into the field hospital with "come with me" missionary-style welcoming in his first of two roles as Missionary/Welcomer. He engaged each in 1:1 conversation and welcomed them into the group, calling them to belong and to love and be loved.

After gathering the 12, he had them serve together: let's go plow this farmer's field together as he is sick and can't do it himself. He had them socialize together: let's have dinner together. This turned the 12 from being lonely and troubled to feeling they truly belonged and mattered in the small group.

## Teach

When they belonged and mattered, and wanted to love their new friends better, Jesus shifted into his 2nd role of "Teacher" to show them how to love with the two greatest commandments

Show love to others and they will love you back (sometimes) and you'll both be happy (2nd greatest)

Realize that God is the source of all that love you feel and happiness turns to joy, in this life and the next (1st greatest)

He had Mary there as the "Nurturer", the perfect example of how to be love with the 2 greatest commandments setting the example for the 12

## Send

His first group assembled was 12+2+1: the 12 welcomed, 2 roles of Jesus (missionary/welcomer, teacher) and 1 role of Mary (nurturer)

Once the 12 "got it" and were joyous living the 2 greatest, then he sent them off in pairs to start six more 12+2+1 groups, going from being 2 of the 12 welcomed to leading in the +2+1 roles of missionary/welcomer, teacher, nurturer.

Repeat for 2000 years and you have 1.4B Catholics organized into 100s of millions of small groups. Each parish has a common patron saint, pastor, and building, but under the hood there are lots of these ministry small groups where folks feel they belong and matter, the parish within the parish.

If you are fortunate enough to find that small group in a parish (or in your family, your friends, or co-workers) where you feel you belong and matter, where you are taught to love and are loved, where you are nurtured, you are blessed and joyous. And the joyous can't help but to share that joy. "Preach the Gospel, sometimes use words".

Unfortunately many in our society today feel they have no true friends. And too many Catholic parishes aren't helping the loneliness epidemic. They are doing the "Teach" without the "Call - Teach - Send", doing the teacher role of Jesus, but too often not the missionary/welcomer role. You can walk into most parishes today, go to mass, and leave and have nobody introduce themselves and welcome you.
`;

  return (
    <div className="container mx-auto p-4">
      <MarkdownRenderer markdown={markdownContent} />
    </div>
  );
}