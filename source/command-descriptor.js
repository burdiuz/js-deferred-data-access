/**
 * Created by Oleg Galaburda on 10.03.16.
 */
//FIXME Instead of sanding hash of commnad name <---> function handler, create objects CommandDescriptor
// which will hold additional properties like canBeTemporary
// if user passes hash, then generate descriptors, canBeTemporary == false by default

//FIXME I can determine if descriptors were sent by input type -- hash or array, if array then require Array<number, {type:string, handler:function, canBeTemporary?:boolean=false}>

var CommandDescriptor = (function() {
  function CommandDescriptor(type, handler) {

  }

  return CommandDescriptor;
})();
