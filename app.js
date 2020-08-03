'user strict';

$(document).ready(function() {

  const fields = {
    district: {
      eng: 'District',
      chi: '地區'
    },
    building: {
      eng: 'Building name',
      chi: '大廈名單'
    },
    date: {
      eng: 'Last date of residence of the case(s)',
      chi: '最後個案居住日期'
    },
    cases: {
      eng: 'Related probable/confirmed cases',
      chi: '相關疑似/確診個案'
    }
  };

  var GOV_DATA = {
    chi: $.map(gov_data_chi, function(item) { return convertResultItem(item, 'chi'); }),
    eng: $.map(gov_data_eng, function(item) { return convertResultItem(item, 'eng'); }),
  };

  var addressConcatByLocale = {};

  // retrives json data
  for (let locale of ['eng', 'chi']) {
    addressConcatByLocale[locale] = $.map(GOV_DATA[locale], function(item) { 
      return item.building; 
    })
    .join('|')
    .replace(/\,/g, '')
    .replace(/\s{2,}/g,' ')
    .toLowerCase();
  }

  // get element
  var $inputArea = $('#input-area');
  var $resultContainer = $('#result-container');
  var $rawContainer = $('#raw-container');
  var $searchFormRaw = $('#searchFormRaw');

  // on paste content input
  $inputArea.bind('paste', function() {
    setTimeout(function () {
      $inputArea.trigger('change');
    }, 10);
  });

  // on change content input
  $inputArea.change(function() {
    var $this = $(this);
    var content = $this.val();

    var contentGrid = $.map(content.split('\n'), function(val) {
      return [val.trim().split(/\t/)];
    });

    // get max col count
    var colCount = 0;
    $.each(contentGrid, function(i, val) {
      colCount = Math.max(val.length, colCount);
    });

    // new grid with same row count
    var tableContentGrid = $.map(contentGrid, function(val) {
      var lengthDiff = colCount - val.length;
      return [(lengthDiff === 0) ? val : val.concat(Array(lengthDiff).fill(''))];
    });

    // build table
    $resultContainer.find('table').remove();
    $resultContainer.prepend(buildGridTable(tableContentGrid));

    // calculate score for each row
    $resultContainer.find('td').each(function() {
      var $this = $(this);
      var cellContent = $this.html();

      // first break strinng to by space
      var stringConponent = prepareSearchComponent(cellContent);

      // get match
      var engCombos = getSearchCombo(stringConponent, ' ', 3, addressConcatByLocale.eng);
      var chiCombos = getSearchCombo(stringConponent, '', 3, addressConcatByLocale.chi);

      cellContent = markComboAnchor(cellContent, chiCombos, 'chi');
      cellContent = markComboAnchor(cellContent, engCombos, 'eng');
      if (engCombos.length || chiCombos.length) {
        $this.addClass('table-warning');
      }

      $this.html(cellContent);
    });

  });

  function markComboAnchor(cellContent, combos, locale) {

    var highlights = [];
    $.each(combos, function(i, matches) {
      var firstMatch = matches[0];
      var lastMatch = matches[matches.length -1];

      var startPos = cellContent.indexOf(firstMatch);
      var endPos = cellContent.indexOf(lastMatch, startPos + firstMatch.length) + lastMatch.length;
      var content = cellContent.substring(startPos, endPos);
      var marker = '{' + i + '}';

      cellContent = cellContent.replace(content, marker);
      highlights.push({ matches, marker, content });
    });

    $.each(highlights, function(i, highlight) {
      var className = getMatchAnchorClass(highlight.matches.length);
      var anchor = createHighlightAnchor(highlight.content, className, locale);
      cellContent = cellContent.replace(highlight.marker, anchor);
    });

    return cellContent;
  }

  $resultContainer.on('click', '.archor-match', function(event) {
    event.preventDefault();
    var $this = $(this);
    $searchFormRaw.find('select').val($this.data('locale'));
    $searchFormRaw.find('input').val($(this).html());
    $searchFormRaw.submit();
  });

  $searchFormRaw.submit(function(event) {
    event.preventDefault();
    reloadRawTable();
  });

  reloadRawTable();

  function reloadRawTable() {

    // get form params
    var locale = $searchFormRaw.find('select').val();
    var keyword = $searchFormRaw.find('input').val();

    var join = locale === 'eng' ? ' ' : '';
    var findString = prepareSearchComponent(keyword).join(join);

    // build raw table
    var rawTableGrid = $.map(GOV_DATA[locale], function(item) {
      var row = [item.district, item.building, item.date, item.cases];

      if (!findString || !item.building) {
        return [row];
      }

      if (item.building
        .replace(/\,/g, '')
        .replace(/\s{2,}/g,' ')
        .toLowerCase()
        .search(findString) === -1) {
        return null;
      }

      return [row];
    });

    $rawContainer.empty().append(buildGridTable(rawTableGrid));
  }

  /**
   * Table building functions
   **/
  function buildGridTable(tableContentGrid) {
    return $('<table/>')
    .addClass('table table-striped table-sm table-bordered')
    .append($('<tbody/>')
      .append($.map(tableContentGrid, buildGridTableRow))
    );
  }

  function buildGridTableRow(contentRow) {
    return $('<tr/>')
    .data('content', contentRow)
    .append($.map(contentRow, buildGridTableCell));
  }

  function buildGridTableCell(contentItem) {
    return $('<td/>').text(contentItem);
  }

  function createHighlightAnchor(text, className, locale) {
    return $('<a>').attr('href', '#')
    .attr('data-locale', locale)
    .addClass('archor-match')
    .addClass(className)
    .text(text)
    .prop('outerHTML');
  }

  function getMatchAnchorClass(length) {
    return length > 3 ? 'text-light bg-danger' : 'text-dark bg-warning';
  }

  function convertResultItem(item, locale) {
    return {
      district: item[fields.district[locale]],
      building: item[fields.building[locale]],
      date:     item[fields.date[locale]],
      cases:    item[fields.cases[locale]]
    }
  }

  /**
   * Searching function
   **/
  function getSearchCombo(keywordComponents, comboJoin, comboCount, searchFromString) {
    var results = [];
    var combo = [];
    var searchComponents = keywordComponents.concat('END_OF_COMPONENTS');
    
    for (var i in searchComponents) {
      combo.push(searchComponents[i]);
      var comboString = escapeRegExp(combo.join(comboJoin));
      var search = searchFromString.search(comboString);
      if (search === -1) {
        if (combo.length > comboCount) {
          combo.pop();
          results.push(combo);
        }
        combo = [];
      }
    }
    return results;
  }

  function prepareSearchComponent(keyword) {
    return keyword.replace(/([^\u0000-\u00ff]{1})/g, '$1 ')
    .replace(/\s{2,}/g,' ')
    .replace(/\,/g, '')
    .trim()
    .split(' ');
  }

  function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&').toLowerCase();
  }
});
