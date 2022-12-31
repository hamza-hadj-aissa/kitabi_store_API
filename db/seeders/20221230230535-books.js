'use strict';

const { Op } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Books', [
      {
        id: 1,
        title: 'Rich dad poor dad',
        author: 'Robert Kiyosaki',
        fk_category_id: 23,
        pages_number: 336,
        price: 3600,
        discount: 5,
        quantity: 50,
        description: `Rich Dad Poor Dad is a 1997 book written by Robert T.
          Kiyosaki and Sharon Lechter. It advocates the importance of financial literacy 
          (financial education), financial independence and building wealth through investing 
          in assets, real estate investing, starting and owning businesses, as well as increasing 
          one's financial intelligence (financial IQ).
          Rich Dad Poor Dad is written in the style of a set of parables, ostensibly based on 
          Kiyosaki's life. The titular "rich dad" is his friend's father who accumulated wealth 
          due to entrepreneurship and savvy investing, while the "poor dad" is claimed to be 
          Kiyosaki's own father who he says worked hard all his life but never obtained financial security.
          No one has ever proven that "Rich Dad", the man who supposedly gave Kiyosaki all his advice 
          for wealthy living, ever existed. Nor has anyone ever documented any vast reserves of wealth 
          earned by Kiyosaki prior to the publication of Rich Dad Poor Dad in 1997.`,
        image: 'rich-dad-poor-dad.jpg',
      },
      {
        id: 2,
        title: 'The miracle morning',
        author: 'Hal Elrod',
        fk_category_id: 15,
        pages_number: 202,
        price: 1900,
        discount: 10,
        quantity: 50,
        description: `Hal Elrod is a genius and his book The Miracle Morning has been magical in my life. 
          What Hal has done is taken the 'best practices'-developed over centuries of human consciousness 
          development-and condensed the 'best of the best; into a daily morning ritual. 
          A ritual that is now part of my day.`,
        image: 'the-miracle-morning.jpg',
      },
      {
        id: 3,
        title: 'Steve Jobs',
        author: 'Walter Isaacson',
        fk_category_id: 21,
        pages_number: 656,
        price: 5500,
        discount: 0,
        quantity: 29,
        description: `Steve Jobs, (born Feb. 24, 1955, San Francisco, Calif., U.S.—died Oct. 5, 2011, Palo Alto, Calif.), 
          U.S. businessman. Adopted in infancy, he grew up in Cupertino, Calif. He dropped out of Reed College and went to work for Atari Corp. 
          designing video games. In 1976 he cofounded (with Stephen Wozniak) Apple Computer (incorporated in 1977; now Apple Inc.). 
          The first Apple computer, created when Jobs was only 21, changed the public’s idea of a computer from a huge machine for scientific use 
          to a home appliance that could be used by anyone. Apple’s Macintosh computer, which appeared in 1984, introduced a graphical user interface and mouse 
          technology that became the standard for all applications interfaces. In 1980 Apple became a public corporation, and Jobs became the company’s chairman. 
          Management conflicts led him to leave Apple in 1985 to form NeXT Computer Inc., but he returned to Apple in 1996 and became CEO in 1997. 
          The striking new iMac computer (1998) revived the company’s flagging fortunes. Under Jobs’s guidance, Apple became an industry leader and one of the most valuable 
          companies in the world. Its other notable products include iTunes (2001), the iPod (2001), the iPhone (2007), and the iPad (2010). In 2003 Jobs was diagnosed with 
          pancreatic cancer, and he subsequently took several medical leaves of absence. In 2011 he resigned as CEO of Apple but became chairman.`,
        image: 'steve-jobs.jpg'
      },
      {
        id: 4,
        title: 'The Maid: A Novel',
        author: 'Nita Prose',
        pages_number: 304,
        fk_category_id: 13,
        price: 2300,
        discount: 15,
        quantity: 0,
        description: `Molly Gray is not like everyone else. She struggles with social skills and misreads the intentions of others. Her gran used to interpret the world for her, codifying it into simple rules that Molly could live by.
          Since Gran died a few months ago, twenty-five-year-old Molly has been navigating life’s complexities all by herself. No matter—she throws herself with gusto into her work as a hotel maid. Her unique character, along with her obsessive love of cleaning and proper etiquette, make her an ideal fit for the job. She delights in donning her crisp uniform each morning, stocking her cart with miniature soaps and bottles, and returning guest rooms at the Regency Grand Hotel to a state of perfection.
          But Molly’s orderly life is upended the day she enters the suite of the infamous and wealthy Charles Black, only to find it in a state of disarray and Mr. Black himself dead in his bed. Before she knows what’s happening, Molly’s unusual demeanor has the police targeting her as their lead suspect. She quickly finds herself caught in a web of deception, one she has no idea how to untangle. Fortunately for Molly, friends she never knew she had unite with her in a search for clues to what really happened to Mr. Black—but will they be able to find the real killer before it’s too late?
          A Clue-like, locked-room mystery and a heartwarming journey of the spirit, The Maid explores what it means to be the same as everyone else and yet entirely different—and reveals that all mysteries can be solved through connection to the human heart.`,
        image: 'the-maid-a-novel.jpg'
      },
      {
        id: 5,
        title: 'A Game of Thrones: A Storm of Swords',
        author: 'George R. R. Martin',
        pages_number: 694,
        fk_category_id: 10,
        price: 6800,
        discount: 25,
        quantity: 17,
        description: `Winter is coming. Such is the stern motto of House Stark, the northernmost of the fiefdoms that owe allegiance to King Robert Baratheon in far-off King’s Landing. There Eddard Stark of Winterfell rules in Robert’s name. There his family dwells in peace and comfort: his proud wife, Catelyn; his sons Robb, Brandon, and Rickon; his daughters Sansa and Arya; and his bastard son, Jon Snow. Far to the north, behind the towering Wall, lie savage Wildings and worse—unnatural things relegated to myth during the centuries-long summer, but proving all too real and all too deadly in the turning of the season.
        Yet a more immediate threat lurks to the south, where Jon Arryn, the Hand of the King, has died under mysterious circumstances. Now Robert is riding north to Winterfell, bringing his queen, the lovely but cold Cersei, his son, the cruel, vainglorious Prince Joffrey, and the queen’s brothers Jaime and Tyrion of the powerful and wealthy House Lannister—the first a swordsman without equal, the second a dwarf whose stunted stature belies a brilliant mind. All are heading for Winterfell and a fateful encounter that will change the course of kingdoms.
        Meanwhile, across the Narrow Sea, Prince Viserys, heir of the fallen House Targaryen, which once ruled all of Westeros, schemes to reclaim the throne with an army of barbarian Dothraki—whose loyalty he will purchase in the only coin left to him: his beautiful yet innocent sister, Daenerys.`,
        image: 'game-of-thrones.jpg'
      },
      {
        id: 6,
        title: 'Moby Dick',
        author: 'Herman Melville',
        pages_number: 378,
        fk_category_id: 24,
        price: 2100,
        discount: 0,
        quantity: 15,
        description: `Moby-Dick; or, The Whale is a novel by Herman Melville, in which Ishmael narrates 
        the monomaniacal quest of Ahab, captain of the whaler Pequod, for revenge on the albino sperm 
        whale Moby Dick, which on a previous voyage destroyed Ahab's ship and severed his leg at the 
        knee. Although the novel was a commercial failure and out of print at the time of the author's 
        death in 1891, its reputation grew immensely during the twentieth century. D. H. Lawrence called 
        it "one of the strangest and most wonderful books in the world," and "the greatest book of 
        the sea ever written." Moby-Dick is considered a Great American Novel and an outstanding work of 
        the Romantic period in America and the American Renaissance. "Call me Ishmael" is one of world 
        literature's most famous opening sentences. The product of a year and a half of writing, the book
         is dedicated to Nathaniel Hawthorne, "in token of my admiration for his genius," and draws on 
         Melville's experience at sea, on his reading in whaling literature, and on literary 
         inspirations such as Shakespeare and the Bible. The detailed and realistic descriptions of 
         whale hunting and of extracting whale oil, as well as life aboard ship among a culturally
          diverse crew, are mixed with exploration of class and social status, good and evil, and the 
          existence of God. In addition to narrative prose, Melville uses styles and literary devices 
          ranging from songs, poetry and catalogs to Shakespearean stage directions, soliloquies and 
          asides. The author changed the title at the very last moment in September 1851. The work 
          first appeared as The Whale in London in October 1851, and then under its definitive title 
          Moby-Dick in New York in November. The whale, however, appears in both the London and New York 
          editions as "Moby Dick," with no hyphen. The British edition of five hundred copies was not 
          reprinted during the author's life, the American of almost three thousand was reprinted three 
          times at approximately 250 copies, the last reprinting in 1871. These figures are exaggerated 
          because three hundred copies were destroyed in a fire at Harper's; only 3,200 copies were 
          actually sold during the author's life.`,
        image: 'moby-dick.jpg'
      },
      {
        id: 7,
        title: 'The Hobbit',
        author: 'J. R. R. Tolkien',
        pages_number: 300,
        fk_category_id: 1,
        price: 3250,
        discount: 30,
        quantity: 34,
        description: `The journey through Middle-earth begins here with J.R.R. Tolkien's classic prelude to his Lord of the Rings trilogy.
        “A glorious account of a magnificent adventure, filled with suspense and seasoned with a quiet humor that is irresistible... 
        All those, young or old, who love a fine adventurous tale, beautifully told, will take The Hobbit to their hearts.”—The New York Times Book Review
        "In a hole in the ground there lived a hobbit." So begins one of the most beloved and delightful tales in the English language—Tolkien's prelude to 
        The Lord of the Rings. Set in the imaginary world of Middle-earth, at once a classic myth and a modern fairy tale, The Hobbit is one of literature's most enduring and well-loved novels.
        Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling any farther than his pantry or cellar. But his contentment is disturbed when the wizard Gandalf 
        and a company of dwarves arrive on his doorstep one day to whisk him away on an adventure. They have launched a plot to raid the treasure hoard guarded by Smaug the Magnificent, a large and very 
        dangerous dragon. Bilbo reluctantly joins their quest, unaware that on his journey to the Lonely Mountain he will encounter both a magic ring and a frightening creature known as Gollum.`,
        image: 'the-hobbit.jpg',
      }
    ], {
      ignoreDuplicates: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Books', null, {
      where: {
        id: [1, 2, 3, 4, 5, 6, 7]
      }
    });
  }
};
