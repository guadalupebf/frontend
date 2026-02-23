// app/services/paquetes-matcher.factory.js
(function () {
  'use strict';

  angular.module('inspinia') // usa tu módulo raíz
    .factory('PaquetesMatcher', PaquetesMatcher);

  function PaquetesMatcher() {
    // ==== Utils ====
    function _normalize(s) {
      if (!s) return '';
      var r = String(s);
      try { r = r.normalize('NFD'); } catch (e) {}
      // quita diacríticos, mayúsculas, compacta espacios
      r = r.replace(/[\u0300-\u036f]/g, '')
           .toUpperCase()
           .replace(/\s+/g, ' ')
           .trim();
      return r;
    }

    function _tokenize(s) {
      s = _normalize(s);
      return s.split(/[^A-Z0-9\+]+/).filter(Boolean);
    }

    // “9 ESTAN” → { base:'ESTANDAR', numero:90 }
    function _parseEstandarTarget(pdfText) {
      var n = _normalize(pdfText);
      var m1 = n.match(/([4-9])\s*E?STAN/);
      if (m1) return { base: 'ESTANDAR', numero: parseInt(m1[1], 10) * 10 };
      var m2 = n.match(/ESTAN(?:DAR)?\s*(\d{2})/);
      if (m2) return { base: 'ESTANDAR', numero: parseInt(m2[1], 10) };
      if (/ESTAN/.test(n)) return { base: 'ESTANDAR', numero: null };
      return null;
    }

    function _buildTargetNameFromPDF(pdfText, despacho) {
      var t = _parseEstandarTarget(pdfText);
      if (t) {
        if (_normalize(despacho) === 'CES') return 'ESTANDAR'; // genérico
        return t.numero ? ('ESTANDAR ' + t.numero) : 'ESTANDAR';
      }
      return _normalize(pdfText); // otros productos
    }

    function _buildTargetNameAxa(planTipo, gamaHospitalaria) {
      var base = _normalize(planTipo || '');
      var gama = _normalize(gamaHospitalaria || '');
      return (base && gama) ? (base + ' ' + gama) : base;
    }

    function _scorePackage(pkgName, targetName) {
      var pkgN = _normalize(pkgName), tgtN = _normalize(targetName);
      if (!pkgN || !tgtN) return -1;
      if (pkgN === tgtN) return 1000; // match exacto

      var pkgT = _tokenize(pkgN);
      var tgtT = _tokenize(tgtN);
      var setPkg = {};
      for (var i = 0; i < pkgT.length; i++) setPkg[pkgT[i]] = true;

      var hits = 0;
      for (var j = 0; j < tgtT.length; j++) if (setPkg[tgtT[j]]) hits++;

      if (hits === 0) return 0;

      var score = 500 * (hits / tgtT.length);
      var extras = Math.max(pkgT.length - tgtT.length, 0);
      score -= extras * 15;

      var numTgt = (tgtN.match(/\b\d+\b/) || [null])[0];
      var numPkg = (pkgN.match(/\b\d+\b/) || [null])[0];
      if (numTgt) {
        if (numPkg && numPkg === numTgt) score += 120;
        else if (numPkg && numPkg !== numTgt) score -= 120;
      } else {
        if (numPkg) score -= 60; // target sin número, evita específicos
      }

      if (pkgN.indexOf(tgtN) === 0) score += 60; // buen prefijo

      return score;
    }

    function _selectBestPackage(targetName, availablePackages) {
      var best = null, bestScore = -Infinity;
      for (var i = 0; i < (availablePackages || []).length; i++) {
        var name = availablePackages[i];
        var s = _scorePackage(name, targetName);
        if (s > bestScore) { bestScore = s; best = name; }
      }
      return { name: best, score: bestScore, target: targetName };
    }

    // ==== API pública ====
    function pickGmmEstandar(pdfText, despacho, availablePackages) {
      var target = _buildTargetNameFromPDF(pdfText, despacho);
      return _selectBestPackage(target, availablePackages);
    }

    function pickAxaFlexPlus(planTipo, gamaHospitalaria, availablePackages) {
      var target = _buildTargetNameAxa(planTipo, gamaHospitalaria);
      return _selectBestPackage(target, availablePackages);
    }
    
    // opcional: exponer helpers para debug/testing
    return {
      pickGmmEstandar: pickGmmEstandar,
      pickAxaFlexPlus: pickAxaFlexPlus,
      _debug: {
        normalize: _normalize,
        tokenize: _tokenize,
        scorePackage: _scorePackage
      }
    };
  }
})();
