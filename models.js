(function() {
    'use strict';

    angular
        .module('inspinia')
        .factory('models', models);

    models.$inject = [];

    function models() {
        var service = {
            beneficiary: beneficiary,
            asegurados: asegurados,
            orderForm: orderForm,
            relationships: relationships,
            auto: auto
        };

        return service;

        function beneficiary(arr) {
            return {
                first_name: '',
                last_name: '',
                second_last_name: '',
                // birthdate: convertDate(new Date()),
                sex: '',
                optional_relationship: '',
                percentage: 0,
                person: 1,
                antiguedad: null
            };
        }

        function asegurados(arr) {
            return {
                first_name: '',
                last_name: '',
                second_last_name: '',
                sex: '',
                smoker: '',
                antiguedad: null,
            };
        }

        function relationships() {
            return {
                first_name: "",
                last_name: "",
                second_last_name: "",
                birthdate: null,
                antiguedad: null,
                sex: null,
                relationship: null,
                accident: null,

            };
        }

        function orderForm() {
            return {
                contratante: '',
                poliza: '',
                folio: '',
                ramo: '',
                type: '',
                subramo: '',
                aseguradora: '',
                paquete: '',
                payment: '',
                startDate: new Date(),
                endingDate: new Date(new Date().setYear(new Date().getFullYear() + 1))
            };
        }

        function auto() {
            return {
                brand: '',
                model: '',
                year: '',
                version: '',
                serial: '',
                engine: '',
                color: '',
                license_plates: ''
            }
        }
    }
})();
