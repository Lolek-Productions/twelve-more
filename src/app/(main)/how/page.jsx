import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function HowPage() {
  const markdownContent = `
# How to Implement "12more" Parish Evangelization

## Creating Your Parish Missionary Council (PMC)

1. **Select Leadership**:
- Find someone with strong "woo" qualities (welcoming personality) using StrengthFinders
- This can be a staff position or volunteer role
- Include pastor, priests, deacons and lay leaders

2. **Implement Welcoming Practices**:
- Station welcomers at every door 30 minutes before each Mass
- Engage newcomers in real conversation (not just handshakes)
- Follow up with coffee invitations to learn about interests
- Connect visitors directly to ministry leaders based on their interests

3. **Simplify Registration Process**:
- Request only name, email, and cell phone initially
- Use QR codes on welcome cards in pews
- Place welcome info prominently in bulletins

4. **Track Key Metrics**:
- Visitors: Christmas/Easter attendance, baptisms, marriages
- Ministry active families (typically equals Sunday Mass attendance)
- Monthly donors (typically equals ministry active families)
- Faith indicators (belief in Real Presence, etc.)

## Success Indicators

- Each 4 new families welcomed typically results in 1 new ministry-active family
- Ministry-active families attend Mass regularly and contribute financially
- The ratio of Christmas-to-Sunday attendance decreases from 4:1 to 2:1
- Faith metrics improve (belief in Real Presence, etc.)
- The welcoming culture becomes self-perpetuating

## Remember:
- Jesus didn't wait for people to come to him
- People need to feel they belong before they're open to teaching
- Ministry-active families drive parish vitality
- A culture of welcoming creates a positive flywheel effect
- The welcoming role typically becomes self-funding through increased giving

*For further information: Tim Connors, tim@connors.org*
  `;

  return (
    <div className="container mx-auto p-4">
      <MarkdownRenderer markdown={markdownContent} />
    </div>
  );
}