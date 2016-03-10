/**
 * Created by Oleg Galaburda on 10.03.16.
 */
//FIXME Instead of sending hash of command name <---> function handler, create objects CommandDescriptor
// which will hold additional properties like canBeTemporary
// if user passes hash, then generate descriptors, canBeTemporary == false by default

/*FIXME I can determine if descriptors were sent by input type -- hash or array, if array then require Array<number, {type:string, handler:function, canBeTemporary?:boolean=false}
 do i need such complexity for ^^^not that important feature

Command descriptor may contain isTemporary method that will be called after first execution of RequestTarget and if temporary, then destroy
Command descriptor may contain set of callbacks like "created(requestTarget)", "called(requestTarget)" that will allow controlling life of TargetResource within Descriptor's custom logic'
*/
var CommandDescriptor = (function() {
  function CommandDescriptor(type, handler) {

  }

  return CommandDescriptor;
})();
