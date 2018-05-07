$(document).ready(function() {

    var gradeArray = [], gradeInterval;
    var resultsChart, gradesChart;

    // Loads exam configuration information from Session
    // if it exists
    $.getJSON("/loadSession", function(grader){
        if (grader !== null)
        {
            $('#gradeMin').val(grader.grade.min);
            $('#gradeMax').val(grader.grade.max);
            $('#gradeInterval').val(grader.grade.interval);
            $('#examMin').val(grader.exam.min);
            $('#examMax').val(grader.exam.max);
            $('#preset').val(grader.exam.preset);
        }
    }).always(updateConfig);
    
    // Updates the current configuration to create/update Exam
    // - Then calls Grader to display Thresholds
    function updateConfig()
    {
        let updateSession = "/updateSession?gradeMin="+$('#gradeMin').val()
        +"&gradeMax="+$('#gradeMax').val()+"&gradeInterval="+$('#gradeInterval').val()
        +"&examMin="+$('#examMin').val()+"&examMax="+$('#examMax').val()+"&preset="+$('#preset').val();
        interval = $('#gradeInterval').val();

        $.getJSON(updateSession).always(function() {
            updateThresholds("/getThresholds")});
    }

    // Updates the Thresholds of Points - Grade
    // (Calls Grader's setByPoint() function)
    // ---
    // Updates the point inputs listeners for each
    // threshold so that they respond to the user's changes
    // ---
    // Updates the exam results, in the case that the grades
    // changed when the thresholds were adjusted
    function updateThresholds(url)
    {
        $.getJSON(url, function(thresholds)
        {
            let gradeTable = "", bellCurveTable = '<th scope="col">Grade</th>';
            $('#thresholdsGraph').html('&nbsp;');
            $('#thresholdsGraph').html('<canvas id="thresholdsCanvas"></canvas>');
            let ctx = document.getElementById('thresholdsCanvas').getContext('2d');

            gradeArray = []; let pointsArray = [];

                for (let g of thresholds)
                {
                    gradeArray.push(g.grade);
                    pointsArray.push(g.points);
                    gradeTable += "<tr><th scope='row'>"+g.grade+"</th>"
                    +"<td><input type='number' step='0.5' class='points number' value='"+g.points+"' max='"+$('#examMax').val()+"' min='"+$('#examMin').val()+"'/></td>"
                    +"<td><input type='number' step='0.5' class='percentages number' value='"+Math.round(g.percentage*100)+"' min=0 max=100/>%</td></tr>";
                    bellCurveTable += '<th scope="col" class="grade">'+g.grade+'</th>';
                }
                $('#gradeTable').html(gradeTable);
                $('#bellCurveTable').html(bellCurveTable);
                createChart(gradesChart, ctx, gradeArray, pointsArray, "points");
                updateListeners();
        }).always(getResults);
    }
    
    // (See function above)
    // When user inputs a change to a Threshold
    // changes it in the Grader object
    function updateListeners()
    {
        $('.points').change(function()
        {
            let url = "/setByPoints?grade="+this.parentNode.previousSibling.innerHTML+"&points="+this.value;
            updateThresholds(url);
        });
    
        $('.percentages').change(function()
        {
            let url = "/setByPercentage?grade="+this.parentNode.previousSibling.previousSibling.innerHTML+"&percentage="+this.value;
            updateThresholds(url);
        });
    }
    
    function createChart(chart, ctx, grades, results, resultsString)
    {
        if (chart != null)
            chart.destroy();

        chart = new Chart(ctx,{
            type: 'bar',
            data: {
                labels: grades,
                datasets: [{
                    label: resultsString,
                    borderColor: 'rgb(0,0,0)',
                    borderWidth: 1,
                    data: results
                }]
            },
        });
    }

    // Adds a student to the session, then updates the table
    // of students
    function addStudent()
    {
        $.getJSON("/addStudent?studentId="+$('#studentId').val()+"&studentName="+$('#studentName').val())
        .always(getResults);
        // Increment id by one for ease of use
        $('#studentId').val(+$('#studentId').val() +1);
        return false;
    }

    // Gets all students and statistics from their results
    function getResults()
    {
        $.getJSON("/getResults", function(stats)
        {
            let results = "";
            $('#resultsGraph').html('&nbsp;');
            $('#resultsGraph').html('<canvas id="resultsCanvas"></canvas>');
            let ctx = document.getElementById('resultsCanvas').getContext('2d');
            let examResults = [];
            if (stats.value.gradeAmount !== null)
                examResults = Object.values(stats.value.gradeAmount);

            // Builds a table of students
            // Student ID - Name - Points - Grade
            for (let student of stats.key)
            {
                results += '<tr><td>'+student.id+'</td>'
                +'<td>'+student.name+'</td>'
                +'<td><input type="number" step="0.5" class="studentResults number" value="'+student.points+'" max="'+$('#examMax').val()+'" min=0 /></td>'
                +'<td>'+student.grade+'</td>'
                +'<td><button class="removeStudent">X</button></td></tr>';
            }
            $('#results').html(results);
            createChart(resultsChart, ctx, gradeArray, examResults, "amount");

            // Builds a table of statistics
            // Mean - Median - Deviation

            // Table row - Points
            if (stats.value.points !== null)
            {
                results = "<tr><td>Points</td>";
                for (let stat of stats.value.points)
                    results += '<td>'+Math.round(stat*100)/100+'</td>';
                results += '</tr><tr><td>Grades</td>';

                // Table row - Grades
                for (let stat of stats.value.grades)
                    results += '<td>'+Math.round(stat*100)/100+'</td>';
                    results += '</td>';
                $('#statistics').html(results);

                results = "<tr><th scope='row'>Points</th>";
                for(let stat of stats.value.suggestedPoints)
                    results += '<td><input readonly type="number" step="1" class="suggestedPoints number" value="'+stat+'" max="'+$('#examMax').val()+'" min=0 /></td>'
                results += '</tr>'
                $('#bellCurvePoints').html(results);
            }
        })
        // After generating a table of students, handle user inputs
        // - Refreshes student results after inputs - .always(getResults))

        .always(function() {
            // User input - changed a student's points
            $('.studentResults').change(function() {
                let url = "/addResult?studentId="+this.parentNode.previousSibling.previousSibling.innerHTML+'&studentResult='+this.value;
                $.getJSON(url).always(getResults);
            });
            // User input - removed a student
            $('.removeStudent').click(function() {
                let url = "/removeStudent?studentId="+this.parentNode.parentNode.firstChild.innerHTML;
                $.getJSON(url).always(getResults);
            });
        });
        return false;
    }

    function peerDistribution()
    {
        $.getJSON("/peerDistribution").always(updateThresholds("/getThresholds"));
        return false;
    }


    // Creates a new Exam object with the configurations the user has set
    // - Creates new grade Thresholds from the settings
    $('#getThresholds').click(updateConfig);

    // User adds a student to the current session
    // - Adds student
    // - Refreshes student results
    $('#addStudent').click(addStudent);

    $('#peerDistribution').click(peerDistribution);           
});


function showResults() {
    $('#resultsContainer').css("display", "block");
    $('#thresholdsContainer').css("display", "none");
  }
  
function showThresholds() {
    $('#resultsContainer').css("display", "none");
    $('#thresholdsContainer').css("display", "block");
}