angular
  .module \ablsdk
  .service \types, (p)->
      types =
          Day: class Day
          Activity: class Activity
          Timeslot: class Timeslot
          is: (get, obj)->
              Type = get types 
              obj instanceof Type
          cast: (get, obj)-->
              Type = get types
              nobj = new Type
              fill = (prop)->
                nobj[prop.0] = prop.1
              obj |> p.obj-to-pairs |> p.each fill
              nobj
      types