jQuery(document).ready(function($) {

    /****************************************************************
     * Application Facetview Theme
     *****************************
     */

    function articleView(options, record) {
        var bj = record.bibjson
        var frag = ""
        frag += "<strong>" + bj.title + "</strong><br>"

        var doi = "none"
        var issns = ""
        for (var i in bj.identifier) {
            var ident = bj.identifier[i]
            if (ident.type === "doi") {
                doi = ident.id
            } else {
                if (issns !== "") {
                    issns += ", "
                }
                issns += ident.id
            }
        }
        frag += "DOI: " + doi + " ISSN(s): " + issns + "<br>"

        var jtitle = ""
        var vol = ""
        var iss = ""
        var year = ""
        if (bj.journal.title) { jtitle = bj.journal.title }
        if (bj.journal.volume) { vol = bj.journal.volume }
        if (bj.journal.number) { number = bj.journal.number }
        if (bj.year) { year = bj.year }
        var citation = jtitle + " Vol: " + vol + " Iss: " + iss + "(" + year + ")"
        frag += citation + "<br>"

        var afrag = ""
        for (var i in bj.author) {
            var auth = bj.author[i]
            if (afrag !== "") { afrag += ", " }
            if (auth.name) { afrag += auth.name }
            if (auth.affiliation) { afrag += " (" + auth.affiliation + ")" }
        }
        frag += "<em>" + afrag + "</em>"

        return frag
    }

    function journalView(options, record) {
        var bj = record.bibjson
        var frag = "<div class='row-fluid'><div class='span8'>"
        frag += "<strong>" + bj.title + "</strong><br>"

        var issns = ""
        for (var i in bj.identifier) {
            var ident = bj.identifier[i]
            if (issns !== "") {
                issns += ", "
            }
            issns += ident.id
        }

        frag += "ISSN(s): " + issns + "<br>"
        if (bj.publisher) { frag += " Publisher: " + bj.publisher + "<br>" }

        var licenses = ""
        if (bj.license) {
            for (var i in bj.license) {
                var lic = bj.license[i]
                if (lic.title) {
                    licenses += lic.title
                }
            }
            frag += licenses
        }

        frag += "</div><div class='span4'>"

        cfrag = ""
        if (bj.apc) {
            cfrag += "APC: " + bj.apc.currency + " " + bj.apc.average_price
        } else {
            cfrag += "No information on APC"
        }
        cfrag += "<br>"
        if (bj.submission_charges) {
            cfrag += "Submission: " + bj.submission_charges.currency + " " + bj.submission_charges.average_price
        } else {
            cfrag += "No information on Submission Charges"
        }
        cfrag += "<br>"
        if (bj.author_copyright) {
            if (bj.author_copyright.copyright) {
                cfrag += "Author retains copyright"
            } else {
                cfrag += "Publisher retains copyright"
            }
        } else {
            cfrag += "No information on author copyright"
        }
        cfrag += "<br>"
        if (bj.author_publishing_rights) {
            if (bj.author_publishing_rights.publishing_rights) {
                cfrag += "Author retains publishing rights"
            } else {
                cfrag += "Publisher retains publishing rights"
            }
        } else {
            cfrag += "No information on publishing rights"
        }
        frag += cfrag

        frag += "</div></div>"
        return frag
    }

    function discoveryRecordView(options, record) {
        var result = options.resultwrap_start;
        result += "<div class='row-fluid' style='margin-top: 10px; margin-bottom: 10px'>"
        result += "<div class='span12'>"

        if (record.bibjson && record.bibjson.journal) {
            result += articleView(options, record)
        } else {
            result += journalView(options, record)
        }

        result += "</div></div>"
        result += options.resultwrap_end;
        return result;
    }

    var facets = []
    facets.push({'field': '_type', 'display': 'Article/Journal'})
    facets.push({'field': 'bibjson.identifier.type', 'display': 'Identifier Type'})
    facets.push({'field': 'index.language.exact', 'display': 'Language of Content'})
    facets.push({'field': 'index.country.exact', 'display': 'Country of Publication'})
    facets.push({'field': 'bibjson.license.type.exact', 'display' : 'Article Licence (Detected)?'})
    facets.push({'field': 'bibjson.license.BY', 'display' : 'Attribution (Detected)?'})
    facets.push({'field': 'bibjson.license.SA', 'display' : 'Share Alike (Detected)?'})
    facets.push({'field': 'bibjson.license.NC', 'display' : 'Non Commercial (Detected)?'})
    facets.push({'field': 'bibjson.license.ND', 'display' : 'No Derivatives (Detected)?'})
    facets.push({'field': 'index.license.exact', 'display': 'Asserted Journal Licence'})
    facets.push({'field': 'bibjson.provider.exact', 'display': 'Provider'})
    facets.push({'field': 'bibjson.deposit_policy.exact', 'display': 'Deposit Policy'})
    facets.push({'field': 'bibjson.author_copyright.copyright', 'display': 'Author Copyright?'})
    facets.push({'field': 'bibjson.author_publishing_rights.publishing_rights', 'display': 'Author Publishing Rights?'})
    facets.push({'field': 'bibjson.allows_fulltext_indexing', 'display': 'Allows Fulltext Indexing?'})
    facets.push({'field': 'bibjson.apc.average_price', 'display': 'APC Average Price'})
    facets.push({'field': 'bibjson.submission_charges.average_price', 'display': 'Submission Average Price'})


    var sortby = []
    sortby.push({'display':'Last Modified','field':'last_updated'})
    sortby.push({'display':'Date Created','field':'created_date'})
    sortby.push({'display':'ISSN','field':'index.issn.exact'})
    sortby.push({'display':'Title','field':'index.title.exact'})
    sortby.push({'display':'Journal Volume (Article)','field':'bibjson.journal.volume.exact'})
    sortby.push({'display':'Journal Issue (Article)','field':'bibjson.journal.number.exact'})
    sortby.push({'display':'Journal Publisher (Article)','field':'bibjson.journal.publisher.exact'})
    sortby.push({'display':'Journal Title (Article)','field':'bibjson.journal.title.exact'})

    var searchon = []
    searchon.push({'display':'ID','field':'id'})
    searchon.push({'display':'ISSN','field':'index.issn'})
    searchon.push({'display':'Title','field':'index.title'})
    searchon.push({'display':'Keywords','field':'index.subject'})
    searchon.push({'display':'Subject Classification','field':'index.classification'})
    searchon.push({'display':'Publisher','field':'index.publisher'})
    searchon.push({'display':'Provider','field':'bibjson.provider'})
    searchon.push({'display':'Institution','field':'bibjson.institution'})
    searchon.push({'display':'Identifier','field':'bibjson.identifier.id.exact'})
    searchon.push({'display':'Abstract','field':'bibjson.abstract'})

    $('#facetview').facetview({
        debug: false,
        search_url : query_endpoint, // defined in the template which calls this
        page_size : 25,
        facets : facets,
        search_sortby : sortby,
        searchbox_fieldselect : searchon,
        render_result_record : discoveryRecordView,

    });

});
