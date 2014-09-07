jQuery(document).ready(function($) {

    /****************************************************************
     * Application Reportview Theme
     *****************************
     */

    // Licence Proportions

    function licenceProportionPreRender(options, context) {
        var total = options.data.found
        $('#licence-count').html(total)
    }

    $('#reportview-licence-proportion').report({
        type: "pie",
        search_url: query_endpoint,
        facets: [
            {
                "field" : "bibjson.license.type.exact",
                "size" : 100,
                "display" : "Licence Type"
            }
        ],
        "fixed_filters" : [
            {"exists" : {"field" : "bibjson.license.type"}}
        ],
        pre_render_callback: licenceProportionPreRender
    });

    // Aspects of Licences

    function reduceAspectDataSeries(options, context) {
        var series = options.data_series
        var new_series = {"key" : "Licence Aspects", "values" : []}
        for (var i = 0; i < series.length; i++) {
            var os = series[i]
            var thevalue = 0
            for (var j = 0; j < os.values.length; j++) {
                var val = os.values[j]
                if (val.label === "T") {
                    thevalue = val.value
                }
            }
            var point = {"label" : os.key, "value" : thevalue}
            new_series.values.push(point)
        }
        options.data_series = [new_series]
    }

    /*
    function tidyLabels(options, context) {
        $("text[text-anchor='start']", context).each(function() {
            var t = $(this).html()
            $(this).html(t.split(".")[0])
        })
    }
    */

    $('#reportview-licence-aspects').report({
        type: 'horizontal_multibar',
        search_url: query_endpoint,
        facets : [
            {
                "field" : "bibjson.license.BY",
                "size" : 2,
                "display" : "BY"
            },
            {
                "field" : "bibjson.license.NC",
                "size" : 2,
                "display" : "NC"
            },
            {
                "field" : "bibjson.license.SA",
                "size" : 2,
                "display" : "SA"
            },
            {
                "field" : "bibjson.license.ND",
                "size" : 2,
                "display" : "ND"
            }
        ],
        pre_render_callback: reduceAspectDataSeries
    })

});
