angular.module('inspinia')
  .controller('TestingCtrl', TestingCtrl);

TestingCtrl.$inject = ['insuranceService', 'receiptService', 'statusReceipt', 'helpers', 'pdfService'];

function TestingCtrl(insuranceService, receiptService, statusReceipt, helpers, pdfService) {
  var vm = this;
  vm.itemArray = [
    { id: 1, name: 'first' },
    { id: 2, name: 'second' },
    { id: 3, name: 'third' },
    { id: 4, name: 'fourth' },
    { id: 5, name: 'fifth' },
  ];

  vm.selectedItem = vm.itemArray[0];

  //var scream = document.getElementById('scream');
  //var myCanvas = document.getElementById('imgCanvas');
  //var ctx = myCanvas.getContext('2d');
  // ctx.drawImage(scream, 10, 10 );

  //var img = new Image();
  //img.setAttribute('crossOrigin', 'anonymous');
  //img.onload = function () {
  //  ctx.drawImage(img, 0, 0); // Or at whatever offset you like
  //};
  //img.src = 'http://localhost:3000/logo.jpg';

  vm.cli = doPdf;
  //vm.cli = function () {
  // var img = 'http://pak101.com/forum/HotEngine/2011/6/13/innocent_cat_zlxso.jpg';
  // helpers.convertToDataURLviaCanvas(img, function(base64Img) {
  //     // Base64DataURL
  // ////console.log(img, base64Img)
  // });
  //var dataAss = myCanvas.toDataURL();
  /////console.log('dataAss', dataAss)

  // dataAss.replace("image/png", "image/octet-stream");
  ////console.log('dataAss', dataAss)


  // ////console.log('canvas.toDataURL()', myCanvas.toDataURL('image/jpg'));
  // ////console.log('canvas.toDataURL()', myCanvas.toDataURL());
  // ////console.log(myCanvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''))
  // ////console.log('img', img.toDataURL());


  //var docDefinition = {
  //  content: [
  //    'pdfmake (since it\'s based on pdfkit) supports JPEG and PNG format',
  //    'If no width/height/fit is provided, image original size will be used', {
  //      image: '../assets/images/logo.png'
  //    }
  //  ]
  //}
  function doPdf() {
    //pdfService.makePdf(rawrContent);
    pdfService.getPdf(3);// pon aqui directamente el ID de una poliza / ot o tambien puede ser objeto obtenido de leer-polzas
  }
  //var content = buildContent(rawrContent)
  ////console.log(content);
  //pdfMake.createPdf(content).open();
}
