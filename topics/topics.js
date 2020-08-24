const topicsArray =
      [["javascript", "typescript"],
       ["ocaml", "haskell"],
       ["c++", "java", "smalltalk"],
       ["fortran", "c"],
       ["LMNtal", "GHC"],
       ["Prolog", "SQL"],
       ["ruby", "python"],
       ["commonLisp", "scheme"]
      ];
       
function getTopics() {
    const topics = topicsArray[Math.floor(Math.random() * topicsArray.length)];
    const citizenTopicI = Math.floor(Math.random() * topics.length);
    let wolfTopicI = Math.floor(Math.random() * topics.length);
    if( wolfTopicI === citizenTopicI ) {
	wolfTopicI = (wolfTopicI + 1) % topics.length;
    }
    const citizenTopic = topics[citizenTopicI];
    const wolfTopic = topics[wolfTopicI];
    return {citizenTopic, wolfTopic};
}

module.exports = getTopics
