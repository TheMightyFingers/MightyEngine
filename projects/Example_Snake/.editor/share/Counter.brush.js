Brush.Counter = Brush.Basic.extend({
 getStage: function(entity){

   switch(entity.tickValue){
      case Counter.Tick._1:
        return this.stages[Brush.Stage._1];
      break;

      case Counter.Tick._2:
        return this.stages[Brush.Stage._2];
      break;

      case Counter.Tick._3:
        return this.stages[Brush.Stage._3];
      break;

      case Counter.Tick._4:
        return this.stages[Brush.Stage._4];
      break;

      case Counter.Tick._5:
        return this.stages[Brush.Stage._5];
      break;

      case Counter.Tick.COUNTER_GO:
        return this.stages[Brush.Stage.COUNTER_GO];
      break;

      case Counter.Tick.COUNTER_END:
        return this.stages[Brush.Stage.COUNTER_END];
      break;

      default:
        return this.stages[Brush.Stage.COUNTER_PLACEHOLDER];
      break;
   }



 }
});