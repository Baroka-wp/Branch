
requirejs(["..jquery"], function (lodash) {
  alert('salut');
});
// $.fn.serializeObject=function(){
//   var formData = {};
//   var formArray = this.serializeArray();

//   for(var i = 0, n = formArray.length; i < n; ++i)
//     formData[formArray[i].name] = formArray[i].value;
//   return formData;
// }

// jquery('input, select').change(function(){
//     var result = jquery('#inscription').serializeObject();
//     console.log(result);
//    console.log('JSON: ' + JSON.stringify(result));
// });

// jquery(".submit").on("click",function(e) {
//    alert("ok"); 
// })
