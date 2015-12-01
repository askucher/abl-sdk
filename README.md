# abl-sdk

![abl-sdk](http://content.screencast.com/users/a.stegno/folders/Jing/media/24a1e61b-195a-44e9-a870-23d84e116bd1/00000337.png)



###abldate service

Transforms date server utc to user friendly date and visa versa. 

```
methods:

* frontendify(string) => new Date()
* backendify(date) => string
```

###ablcalc service

Calculates activity price includes add-ons, coupons, etc.

```
methods:

* totalWithoutTaxesfees()
* calcTaxFee()
* calcTaxesFees()
* showPrice()
* calcPrice()
* showAddonPrice()
* calcAddonPrice()
* totalAddons()
* calcTotal()
```