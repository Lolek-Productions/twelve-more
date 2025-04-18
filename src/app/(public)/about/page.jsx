'use client'

import React from 'react';
import Image from 'next/image';

export default function AboutPage() {
  const teamMembers = [
    {
      id: 1,
      name: 'Tim Connors',
      role: 'Co-Founder',
      bio: 'Tim Connors brings over 17 years of experience as a venture capitalist, founding PivotNorth Capital after serving as a partner at Sequoia Capital and USVP. With a background in computer science and business from Stanford, Harvard, and Notre Dame, he combines technical expertise with strategic Catholic insight.',
      imagePath: '/assets/tim-connors.jpg',
    },
    {
      id: 2,
      name: 'Joe Sterett',
      role: 'Lead Developer',
      bio: 'Joe Sterett brings extensive IT leadership experience to the 12More team. With an MBA in Management Information Systems from St. Edward\'s University and a Bachelor of Science in Computer Science from Franciscan University of Steubenville. Joe combines technical expertise with strong business acumen. ',
      imagePath: '/assets/joe-sterett.jpg',
    },
    {
      id: 3,
      name: 'Maria Xavier',
      role: 'Community Growth Specialist',
      bio: 'Maria Xavier brings a passion for supporting faith communities to the 12More team. With a Master of Education from City University of Seattle and a Bachelor of Arts from Franciscan University of Steubenville.  Maria excels in helping parishes implement effective community growth strategies. ',
      imagePath: '/assets/maria-xavier.jpg',
    },
    {
      id: 4,
      name: 'Fr. Josh McCarty',
      role: 'Spiritual Director',
      bio: 'Fr. Josh McCarty brings pastoral leadership and technological innovation to the 12More team. With a Master of Science in Ecclesial Administration and Management from Catholic University and seminary formation at St. Meinrad, Fr. McCarty serves as the Pastor at St. Leo in Murray and Chaplain for the Newman Catholic Center.',
      imagePath: '/assets/josh-mccarty.jpg',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">About TwelveMore</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Inspired by Jesus's method of forming his first community, TwelveMore is built on the
          <span className="font-semibold"> Call → Teach → Send </span>
          model. Our dedicated team works to help parishes and small groups create communities where people
          feel welcomed, grow in faith, and are empowered to share that joy with others.
        </p>
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">Our Founders</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {teamMembers.map((member) => (
        <div key={member.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col sm:flex-row h-full">
          <div className="sm:w-2/5 relative px-5 py-7">
            <div className="aspect-square relative bg-gray-200 flex items-center justify-center rounded-lg overflow-hidden">
              {member.imagePath && (
                <div className="absolute inset-0">
                  <Image
                    src={member.imagePath}
                    alt={member.name}
                    className="object-cover"
                    fill
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    onError={(e) => {
                      // Hide the image on error
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="p-6 sm:w-3/5">
            <h3 className="text-2xl font-bold text-gray-800">{member.name}</h3>
            {/*<p className="text-blue-600 font-medium mb-4">{member.role}</p>*/}
            <p className="text-gray-600">{member.bio}</p>
          </div>
        </div>
      ))}
    </div>

    </div>
  );
}