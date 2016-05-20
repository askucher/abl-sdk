angular
  .module \app
  .service \types, ->
      types =
          Day: class Day
          Activity: class Activity
          Timeslot: class Timeslot
          cast: (get, obj)-->
              Type = get types
              nobj = new Type
              fill = (prop)->
                nobj[prop.0] = prop.1
              obj |> p.obj-to-pairs |> p.each fill
              nobj
      types