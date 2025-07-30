import levenshtein from "./levenshtein";

class LevenshteinSorter{
  /**
   * 
   * @param {object} query contains team1 and team2, all lowercase
   */
  constructor(query){
    this.query = query;
  }
  /**
   * picksk closest levenshtein distance from away team name, home team name, and event name
   * and also min of each individual word (make sure shenhua = Shanghai Shenhua)
   * @param {Object} eventObj event object that must have attributes .awayTeam, .homeTeam, and .event
   * @returns number
   */
  minLevDist(eventObj){
    return Math.min(
      levenshtein(eventObj.awayTeam.toLowerCase(), this.query.team1),
      levenshtein(eventObj.homeTeam.toLowerCase(), this.query.team1),
      levenshtein(eventObj.awayTeam.toLowerCase(), this.query.team2),
      levenshtein(eventObj.homeTeam.toLowerCase(), this.query.team2),
    );
  }
  /**
   * for use in sorting an array of event objects from most to least similar to query
   * @param {Object} eventObjA must have .awayTeam and .homeTeam and .event attrributes
   * @param {Object} eventObjB 
   * @returns number, negative if A goes in front, positive if B
   */
  sort(eventObjA, eventObjB){
    let levA = this.minLevDist(eventObjA);
    let levB = this.minLevDist(eventObjB);
    if(levA < levB){
      return -1;
    }
    else if(levA > levB){
      return 1;
    }
    else{
      return 0;
    }
  }
}
export default LevenshteinSorter;