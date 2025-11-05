import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Clock,
  BookOpen,
  Video,
  Award,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { notFound } from "next/navigation";

const courses = {
  "kp-astrology": {
    id: "kp-astrology",
    title: "KP Astrology",
    tagline: "Learn KP in its original form. No adulteration and confusion.",
    description:
      "KP Astrology, or Krishnamurti Paddhati, is a simplified yet highly accurate system of astrology that allows you to understand and predict life events with remarkable precision.",
    instructor: "To be announced",
    duration: "25 live sessions",
    fee: "Rs. 20,000 | USD 250 for Outside India",
    priceId: "price_kp_astrology",
    features: [
      "25 live sessions on Zoom",
      "Free KP StarOne Classic Software Licence with one year subscription",
      "Session recording link with 3 months validity after the class",
      "Study Materials",
      "Certificate of completion",
      "Case Studies",
    ],
    whyLearnIntro:
      "KP Astrology, or Krishnamurti Paddhati, is a simplified yet highly accurate system of astrology that allows you to understand and predict life events with remarkable precision. Here's why you should consider learning it:",
    whyLearn: [
      {
        title: "Precision and Accuracy",
        description:
          "KP Astrology is renowned for its ability to provide highly specific predictions by focusing on the sub-lords of planets and houses. This makes it more accurate compared to traditional methods.",
      },
      {
        title: "Simplified Approach",
        description:
          "Unlike complex Vedic astrology systems, KP Astrology uses straightforward principles and techniques, making it easier to learn and apply.",
      },
      {
        title: "Timely Predictions",
        description:
          "With tools like ruling planets and cuspal interlinks, KP Astrology enables you to predict the timing of events such as career changes, marriages, or financial gains with clarity.",
      },
      {
        title: "Practical Applications",
        description:
          "It helps you offer practical solutions and guidance for real-life problems like health, relationships, career growth, and financial stability.",
      },
      {
        title: "Empowering Decision-Making",
        description:
          "By mastering KP Astrology, you can guide yourself and others to make informed decisions and align actions with favorable planetary influences.",
      },
      {
        title: "Universal Relevance",
        description:
          "The method applies to all aspects of life, making it a valuable skill for personal growth, professional consultation, or spiritual exploration.",
      },
    ],
    whatYouLearn: `In KP Astrology (Krishnamurti Paddhati), you learn a precise and systematic approach to understanding astrology, focusing on accurate predictions and detailed chart analysis. It is a unique method that combines traditional Vedic astrology with innovative techniques for greater accuracy.

You study the role of nakshatras (constellations) and their sub-lords, which are the foundation of KP Astrology. This system teaches you how to interpret the intricate relationship between planets, houses, and sub-lords to predict events with precision. 

You learn to analyze birth charts to uncover insights into career, relationships, finances, health, and other aspects of life. KP Astrology emphasizes the concept of cusps and ruling planets, enabling you to time events like marriage, job changes, or travel accurately. 

You also learn techniques like the ruling planet theory and cuspal interlinks to refine predictions further. Through KP Astrology, you gain a deep understanding of how celestial influences shape an individual's life path. This knowledge empowers you to provide practical and reliable guidance, helping others make informed decisions and navigate life's challenges effectively.`,
    courseContent: [
      "The Zodiac and Its Divisions",
      "Differences between KP Astrology and Traditional Vedic Astrology",
      "Understanding the Fundamental principles of KP (Krishnamurti Paddhati) of KP Astrology",
      "Zodiac signs, planets, houses, and their significations",
      "Understanding the Sub Lord Theory",
      "Role of Nakshatras (constellations) and sub-lords in KP",
      "Preparation and Use of the 1-249 Table",
      "Comparison of Sayana and Nirayana Systems",
      "Importance of the Placidus House System",
      "Preparation of Lagna Charts and Cuspal Charts",
      "The concept of cusps and cusp sub-lords",
      "Identifying significators for each planet",
      "Identifying significators for each house",
      "How to use house significations for accurate predictions",
      "Significance of Ruling Planets (RP) in prediction",
      "Western Aspects in KP Astrology",
      "Overview of the Dasha System",
      "Interpreting KP charts ( Finding Promises): Health, Financial Status, Marriage & Relationships, Children, Education, Profession, Litigations, Property, Foreign Settlement, etc.",
      "Predicting timing of events using the Dasha-Bhukti-Antara system",
      "Planetary Transits (Gochar) in KP Astrology",
      "Fortuna and Its Significance",
      "Prashna Kundali (Horary Astrology)",
      "Techniques to Determine Auspicious Timing",
      "Birth Time Rectification",
      "KP Remedies and Their Applications",
    ],
    relatedTopics: [
      "Astrology",
      "Vedic Astrology",
      "Prediction",
      "Horoscope Analysis",
    ],
    enrollment: {
      title: "Enroll in KP Astrology Course",
      description: "Master the precise and powerful system of KP Astrology",
      offer: {
        badge: "Limited Seats Available",
        guarantee: "100% Satisfaction Guarantee",
      },
      features: [
        {
          icon: "Calendar",
          text: "Starting: To Be Announced",
        },
        {
          icon: "Clock",
          text: "Time: 11:00 AM to 12:00 PM",
        },
        {
          icon: "Users",
          text: "Faculty: To Be Announced",
        },
      ],
    },
    disclaimer:
      "The content provided in this course is for informational purposes only and is not intended to be, nor should it be construed as, professional astrological advice. For personalized guidance, consult a licensed astrologer.",
  },
  "financial-astrology": {
    title: "Financial Astrology for Stocks and Commodities Market",
    tagline:
      "Learn to forecast stock and commodities market using the ancient science of mundane and modern astrology",
    description:
      "Financial Astrology is a unique blend of astrology and finance, offering insights into the timing and patterns of financial markets, investments, and personal wealth.",
    instructor: "To be announced",
    duration: "15 live sessions",
    fee: "Rs. 20,000 | USD 250 for Outside India",
    priceId: "price_financial_astrology",
    features: [
      "15 live sessions on Zoom",
      "Session recording link",
      "Study Materials",
      "Certificate of Completion",
    ],
    whyLearnIntro:
      "Financial Astrology is a unique blend of astrology and finance, offering insights into the timing and patterns of financial markets, investments, and personal wealth. Here are some key reasons to learn this fascinating discipline:",
    whyLearn: [
      {
        title: "Predict Market Trends",
        description:
          "Financial astrology helps you understand market cycles, trends, and potential fluctuations based on planetary movements, giving you an edge in anticipating financial shifts.",
      },
      {
        title: "Timing Investments",
        description:
          "By analyzing astrological charts, you can identify the best times to buy, sell, or hold investments, maximizing returns and minimizing risks.",
      },
      {
        title: "Wealth Management",
        description:
          "Financial astrology can provide guidance on budgeting, saving, and planning for long-term financial stability, based on astrological indicators aligned with your personal chart.",
      },
      {
        title: "Insight into Global Economics",
        description:
          "You can also gain a better understanding of the broader economic environment, using astrology to forecast major financial events, recessions, or growth periods.",
      },
      {
        title: "Boost Your Decision-Making",
        description:
          "By understanding the cosmic influences on financial markets, you can make more informed decisions, ensuring your strategies are in alignment with favorable planetary energy.",
      },
      {
        title: "Comprehensive Personal Financial Strategy",
        description:
          "Financial astrology helps you align your financial decisions with your individual astrological chart, optimizing both short-term and long-term financial goals.",
      },
      {
        title: "Unique Skill for Professionals",
        description:
          "If you're a financial planner, investor, or businessperson, learning financial astrology adds a unique layer of expertise to your practice, offering a new perspective on wealth-building strategies.",
      },
      {
        title: "Improve Financial Intuition",
        description:
          "It strengthens your intuition, guiding you to make better financial choices by recognizing the influence of cosmic cycles on your wealth.",
      },
    ],
    whatYouLearn: `In Financial Astrology, you will learn how to combine astrology with financial decision-making to predict and optimize market trends, investments, and personal wealth. Here are the key concepts you will explore:

1. Planetary Influence on Markets: You will learn how planetary movements, such as Mercury retrograde, Venus transits, and the positioning of Jupiter and Saturn, impact market behavior and economic cycles.

2. Timing of Investments: You will discover how to use astrological charts to identify the best times for buying, selling, and holding assets, helping you maximize profits and minimize losses.

3. Understanding Financial Cycles: Learn how to predict long-term and short-term financial trends by analyzing the movement of major planets and their relationship with market cycles.

4. Stock Market Astrology: You will learn how to read and interpret the astrology charts of individual stocks, commodities, or sectors to assess their potential for growth or decline.

5. Personal Financial Astrology: Learn how your birth chart influences your financial decisions, spending habits, career growth, and investment tendencies, helping you align your personal finances with your cosmic blueprint.

6. Risk Management: By using astrological tools, you'll gain insight into potential risks in investments or business ventures and learn how to mitigate them.

7. Combining Astrology with Traditional Finance: Learn how to integrate astrological insights with traditional financial analysis, such as technical and fundamental analysis, to make more informed financial decisions.

8. Personalized Financial Strategies: You will develop personalized financial strategies by analyzing your natal chart and understanding the timing and nature of your financial growth opportunities.

Through Financial Astrology, you will gain a deeper understanding of the energetic forces influencing your financial life, equipping you with tools to make informed, strategic decisions in wealth-building and investment.`,
    courseContent: [
      "Foundations of Vedic Astrology for Market Traders",
      "Commodities and Sectors Represented by the 12 Zodiac Signs",
      "Planets Governing Specific Commodities and Market Sectors",
      "Astrological Influences on Market Fluctuations",
      "Introduction to the Basics and Importance of Technical Analysis",
      "Impact of Sun Transits through the 12 Signs (Sankranti)",
      "Influence of Fast-Moving Planetary Transits on the 12 Signs",
      "Horoscope Combinations That Indicate Wealth from Stock Markets",
      "Market Impact of Solar and Lunar Eclipses",
      "Sarvato Bhadra Chakra (SBC): Formation and Its Role in Financial Astrology",
      "Significance of Western Aspects in Financial Astrology",
      "Forecasting Intraday and Positional Trading Trends",
      "Techniques for Predicting Nifty and Bank Nifty Movements",
      "Using Panchak (from Panchang) to Predict Monthly Market Highs and Lows",
      "Applying the Dhruvaank Method to Forecast Commodities",
      "Effects of Planetary Retrogression, Progression, Setting, and Rising on Markets",
      "Methods to Predict Short-, Mid-, and Long-Term Trends in Stocks and Commodities",
      "Case Studies and Practical Examples",
    ],
    relatedTopics: ["Astrology", "Finance", "Stock Market", "Commodities"],
    enrollment: {
      title: "Enroll in Financial Astrology Course",
      description: "Master the art of financial forecasting with astrology",
      offer: {
        badge: "Limited Seats Available",
        guarantee: "100% Satisfaction Guarantee",
      },
      features: [
        {
          icon: "Calendar",
          text: "Starting: To Be Announced",
        },
        {
          icon: "Clock",
          text: "Time: 11:00 AM to 12:00 PM",
        },
        {
          icon: "Users",
          text: "Faculty: To Be Announced",
        },
      ],
    },
    disclaimer: `The content provided in this course is for informational purposes only and is not intended to be, nor should it be construed as, financial, investment, trading, or any other form of professional advice.
For personalized financial, investment, or trading guidance, it is strongly recommended that you consult a licensed financial advisor, broker, or other qualified professional. This course is not a substitute for professional consultation and should not be relied upon as the sole basis for making financial decisions.
Any actions you take based on the information shared during this course are entirely your responsibility. Neither the institute nor the instructors shall be held liable for any decisions or actions you undertake as a result of the information provided.`,
  },
  "vastu-shastra": {
    title: "MEGA VASTU",
    tagline:
      "The most comprehensive course on vastu based on best practices of vedic and modern vastu including most fruitful and effective vastu remedies without demolition.",
    description:
      "Vastu Shastra is the ancient Indian science of architecture and design that enhances the well-being, prosperity, and harmony of occupants by aligning spaces with natural energies.",
    instructor: "To be announced",
    duration: "15 live sessions",
    fee: "Rs. 20,000 | USD 250 for Outside India",
    priceId: "price_mega_vastu",
    features: [
      "15 live sessions on Zoom",
      "Free Vastuteq Classic Software Licence with one year subscription",
      "Session recording link",
      "Study Materials",
      "Certificate of Completion",
    ],
    whyLearnIntro:
      "Learning Vastu Shastra, the ancient Indian science of architecture and design, offers numerous benefits for enhancing your personal and professional life. It provides a deeper understanding of how the energy flow within a space influences the well-being, prosperity, and harmony of its occupants.",
    whyLearn: [
      {
        title: "Create Harmonious Spaces",
        description:
          "By studying Vastu, you can create homes, workplaces, and environments that are aligned with natural energies, fostering positivity, health, and success.",
      },
      {
        title: "Understand Energy Flow",
        description:
          "It helps you understand the role of directions, layouts, and elements like earth, water, fire, air, and space in designing balanced and harmonious spaces.",
      },
      {
        title: "Resolve Life Issues",
        description:
          "Vastu principles can guide you in resolving issues related to health, relationships, and finances by identifying and correcting energy imbalances in your surroundings.",
      },
      {
        title: "Make Informed Decisions",
        description:
          "It empowers you to make informed decisions about property selection, interior design, and placement of key elements in your space.",
      },
      {
        title: "Enhance Well-being",
        description:
          "Incorporating Vastu into your life not only promotes spiritual growth but also enhances productivity, creativity, and peace of mind.",
      },
      {
        title: "Practical Tools",
        description:
          "Learning Vastu equips you with practical tools to harmonize your environment and create a space that supports your goals and aspirations.",
      },
    ],
    whatYouLearn: `In Vastu Shastra, you learn how to design and organize spaces in harmony with natural energies to create a balanced and positive environment. It includes understanding the five elements (earth, water, fire, air, and space) and their influence on the flow of energy in a building.

You study the importance of directions and orientations, such as the significance of the north, south, east, and west, and how they impact various aspects of life like health, wealth, and relationships. The course also covers the ideal placement of rooms, doors, windows, furniture, and utilities to optimize energy flow.

You learn techniques to identify and rectify energy imbalances or defects (Vastu doshas) in existing structures and how to implement remedies for improving harmony. Additionally, you gain insights into site selection, construction planning, and architectural layouts that align with Vastu principles.

Vastu also teaches you how to apply these principles to modern homes, offices, and commercial spaces, blending ancient wisdom with contemporary needs. Overall, it provides you with tools to create spaces that promote peace, prosperity, and well-being.`,
    courseContent: [
      "Overview of Vastu Shastra and the Vastu Purusha",
      "Land Selection: Shapes of Land, Vithi Shool, Type of Soil",
      "Principles of energy flow and cosmic forces",
      "Importance of the eight cardinal directions",
      "Using a compass to determine orientation",
      "The role of the Brahmasthan (central energy zone)",
      "Vastu Pad Vinyas and Marm Sthan",
      "The significance of the five elements: Earth, Water, Fire, Air, and Space",
      "Theory of Creation in Vastu Principles",
      "Theory of Destruction and Balancing the Elements",
      "Attributes of the Sixteen Vastu Zones",
      "How to balance energy zones in homes",
      "Bar Chart Technique for Vastu Analysis",
      "Ideal directions for the main door and entrances",
      "Best Directions for Activities Placement",
      "Best Directions for Placing Home Appliances and Objects",
      "Designing offices, shops for success and profitability",
      "Placement of desks, cash counters, and workstations in offices",
      "Directional guidelines for business growth",
      "The Role of Date of Birth (DOB) in Vastu",
      "Remedies for common Vastu defects without reconstruction",
      "Subject wise Vastu Remedies",
    ],
    relatedTopics: [
      "Architecture",
      "Design",
      "Feng Shui",
      "Space Optimization",
    ],
    enrollment: {
      title: "Enroll in MEGA VASTU Course",
      description:
        "Master the art of harmonious space design with Vastu Shastra",
      offer: {
        badge: "Limited Seats Available",
        guarantee: "100% Satisfaction Guarantee",
      },
      features: [
        {
          icon: "Calendar",
          text: "Starting: To Be Announced",
        },
        {
          icon: "Clock",
          text: "Time: 11:00 AM to 12:00 PM",
        },
        {
          icon: "Users",
          text: "Faculty: To Be Announced",
        },
      ],
    },
    disclaimer:
      "The content provided in this course is for informational purposes only and is not intended to be, nor should it be construed as, professional architectural or design advice. For personalized guidance, consult a licensed Vastu practitioner or architect.",
  },
  "astro-vastu": {
    title: "ASTRO VASTU",
    tagline:
      "Learn to connect astrology and vastu to get most amazing results with the help of astro-vastu remedies.",
    description:
      "Astro-Vastu combines the wisdom of astrology and Vastu Shastra, offering a holistic approach to harmonizing your life and surroundings. It helps you understand how celestial influences, as seen in your birth chart, interact with the energy dynamics of your living and working spaces.",
    instructor: "To be announced",
    duration: "15 live sessions",
    fee: "Rs. 20,000 | USD 250 for Outside India",
    priceId: "price_astro_vastu",
    features: [
      "15 live sessions on Zoom",
      "Session recording link",
      "Study Materials",
      "Certificate of completion",
    ],
    whyLearnIntro:
      "Vastu Shastra, the ancient Indian science of architecture, offers profound insights into creating harmonious and prosperous living and working environments. Learning Astro-Vastu combines the wisdom of astrology and Vastu Shastra, offering a holistic approach to harmonizing your life and surroundings.",
    whyLearn: [
      {
        title: "Enhance Positive Energy",
        description:
          "Vastu teaches you how to align your surroundings with natural energies, promoting health, happiness, and success.",
      },
      {
        title: "Create Balanced Spaces",
        description:
          "By understanding the elements (earth, water, fire, air, and space) and their interaction, you can design spaces that bring balance and harmony to life.",
      },
      {
        title: "Resolve Life Challenges",
        description:
          "Vastu provides remedies for correcting energy imbalances (Vastu doshas), helping to overcome issues related to health, relationships, and finances.",
      },
      {
        title: "Boost Prosperity and Growth",
        description:
          "Learning Vastu helps you design spaces that attract wealth, improve productivity, and support personal and professional growth.",
      },
      {
        title: "Guidance for Modern Living",
        description:
          "Vastu principles can be applied to modern homes, offices, and commercial spaces, blending ancient wisdom with contemporary needs.",
      },
      {
        title: "Informed Decision-Making",
        description:
          "It equips you with tools to select the right property, plan construction, and position furniture for optimal benefits.",
      },
      {
        title: "Spiritual and Personal Growth",
        description:
          "Vastu not only enhances physical surroundings but also fosters inner peace, self-awareness, and spiritual well-being.",
      },
      {
        title: "Practical Skillset",
        description:
          "Whether you're an architect, interior designer, or homeowner, Vastu knowledge adds a valuable skill that benefits both personal and professional life.",
      },
    ],
    whatYouLearn: `In Astro-Vastu, you learn to integrate the principles of astrology and Vastu Shastra to create harmonious living and working spaces that align with your astrological blueprint. The course teaches you how planetary positions in your birth chart influence specific directions, elements, and energy patterns in your surroundings.

You study how to analyse a birth chart to identify favourable directions and placements for rooms, furniture, and key elements in a space. You also learn how to address Vastu doshas (defects) using astrological remedies, such as gemstones, colours, or specific placements, to balance energy and enhance positive outcomes.

Astro-Vastu provides insights into the connection between celestial bodies and the five elements (earth, water, fire, air, space) and how to harmonize them in your environment. You also gain knowledge about designing and organizing spaces tailored to an individual's zodiac sign and planetary influences.

Through this, you can optimize health, relationships, prosperity, and spiritual growth by synchronizing internal energies with external surroundings. Additionally, you learn practical techniques for selecting or modifying properties based on astrological and Vastu principles. This fusion of sciences empowers you to create spaces that align with personal and cosmic energies.`,
    courseContent: [
      "Connecting Astrology with Vastu Principles",
      "Application of KP Scripts in Astro-Vastu",
      "Understanding the Hit Theory",
      "Techniques to Neutralize Negative Hits on Planets and Cusps",
      "Planet and House Activation Methods",
      "Identifying Benefic and Malefic Planets in a Chart",
      "Locating Planet-Related Objects in the Home and Their Role in Remedies",
      "Utilising the Energy of bad Houses in Astrology by Aligning Karmas to get positive results",
      "Creating New Opportunities with the Help of Benefic Planets",
      "Astro-Vastu Remedies and Applications",
      "Practical Case Studies",
    ],
    relatedTopics: [
      "Astrology",
      "Vastu Shastra",
      "Architecture",
      "Space Harmonization",
    ],
    enrollment: {
      title: "Enroll in ASTRO VASTU Course",
      description:
        "Master the art of harmonizing spaces with celestial energies",
      offer: {
        badge: "Limited Seats Available",
        guarantee: "100% Satisfaction Guarantee",
      },
      features: [
        {
          icon: "Calendar",
          text: "Starting: To Be Announced",
        },
        {
          icon: "Clock",
          text: "Time: 11:00 AM to 12:00 PM",
        },
        {
          icon: "Users",
          text: "Faculty: To Be Announced",
        },
      ],
    },
    disclaimer:
      "The content provided in this course is for informational purposes only and is not intended to be, nor should it be construed as, professional astrological or architectural advice. For personalized guidance, consult a licensed astrologer or Vastu practitioner.",
  },
};


export default async function CoursePage({
  params,
}: {
  params: { course: string };
}) {
  const course = courses[params.course as keyof typeof courses];

  if (!course) {
    notFound();
  }

  const getIcon = (iconName: string) => {
    const icons = {
      Video,
      Award,
      Clock,
      Calendar,
      Users,
    };
    return icons[iconName as keyof typeof icons] || Clock;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Hero Section */}
      <div className="relative py-12 mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              {course.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {course.tagline}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {course.relatedTopics.map((topic) => (
                <Badge
                  key={topic}
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Course Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-6 leading-relaxed">{course.description}</p>
                <div className="grid sm:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-purple-500" />
                    <div>
                      <div className="font-medium">Instructor</div>
                      <div className="text-muted-foreground">
                        {course.instructor}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-purple-500" />
                    <div>
                      <div className="font-medium">Duration</div>
                      <div className="text-muted-foreground">
                        {course.duration}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Course Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {course.features.map((feature, index) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Why Learn {course.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-6 leading-relaxed">{course.whyLearnIntro}</p>
                <Accordion type="single" collapsible className="w-full">
                  {course.whyLearn.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="hover:text-purple-500 transition-colors">
                        {item.title}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {item.description}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Course Content</CardTitle>
                <CardDescription>
                  Comprehensive curriculum with {course.courseContent.length}{" "}
                  detailed lectures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {course.courseContent.map((content, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 hover:bg-muted rounded-lg transition-colors group"
                    >
                      <BookOpen className="h-5 w-5 mt-1 text-purple-500 group-hover:scale-110 transition-transform" />
                      <span className="leading-relaxed">{content}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-24 hover:shadow-lg transition-shadow duration-300 border-purple-500/20">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-t-lg">
                <CardTitle className="text-2xl">
                  {course.enrollment.title}
                </CardTitle>
                <CardDescription>
                  {course.enrollment.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                      {course.fee}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-purple-500/10 text-purple-500"
                    >
                      {course.enrollment.offer.badge}
                    </Badge>
                  </div>
                  <div className="grid gap-4 p-4 bg-muted/50 rounded-lg">
                    {course.enrollment.features.map((feature, index) => {
                      const IconComponent = getIcon(feature.icon);
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5 text-purple-500" />
                          <span className="text-sm">{feature.text}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* <ProductBuyForm priceId={course.priceId} /> */}
                  <p className="text-sm text-muted-foreground text-center italic">
                    {course.enrollment.offer.guarantee}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}