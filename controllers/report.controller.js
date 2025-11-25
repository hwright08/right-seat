/** @module controllers/report */

const userController = require('./user.controller');
const path = require('path');
const dayjs = require('dayjs');

// Set up PdfMake
const pdfPrinter = require('pdfmake');
const pdfStyles = {
  h1: {
    fontSize: 22,
    bold: true,
    margin: [0, 0, 0, 10]
  },
  h2: {
    fontSize: 20,
    bold: true,
    margin: [0, 10, 0, 5]
  },
  h3: {
    fontSize: 16,
    bold: true,
    margin: [0, 10, 0, 5]
  },
  tableExample: {
    margin: [0, 5, 0, 15]
  },
  tableOpacityExample: {
    margin: [0, 5, 0, 15],
    fillColor: 'blue',
    fillOpacity: 0.3
  },
  tableHeader: {
    bold: true,
    fontSize: 13,
    color: 'black'
  }
};
const fonts = {
  Roboto: {
    normal: path.join(__dirname, '..', 'public', 'fonts', 'Roboto-Regular.ttf'),
    bold: path.join(__dirname, '..', 'public', 'fonts', 'Roboto-Medium.ttf'),
    italics: path.join(__dirname, '..', 'public', 'fonts', 'Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, '..', 'public', 'fonts', 'Roboto-MediumItalic.ttf'),
  }
}

/** Print a Student's Syllabus details */
exports.printLessons = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const profile = await userController.findUser({ id: userId });
    const lessons = await userController.getStudentLessons(userId);
    const completeLessonCount = lessons.reduce((sum, lesson) => lesson.userLesson.status == 'completed' ? sum + 1 : sum, 0);

    const lessonContent = lessons.map(lesson => {
      const vals = [];
      let status;
      // Set the lesson status label
      switch (lesson.userLesson?.status) {
        case 'completed':
          status = 'Complete';
          break;
        case 'in-progress':
          status = 'In Progress';
          break;
        default:
          status = 'Incomplete';
          break;
      }

      // Put together the individual lessons for the PDF
      vals.push({ text: lesson.title, style: 'h2' });
      vals.push({ text: `Status: ${status}`});
      vals.push({ text: 'Objective', style: 'h3' });
      vals.push({ text: lesson.objective });
      vals.push({ text: 'Lesson', style: 'h3' });
      vals.push({ text: lesson.content });
      vals.push({ text: 'Completion Criteria', style: 'h3' });
      vals.push({ text:  lesson.completion });
      vals.push({ text: 'Notes', style: 'h3' });
      vals.push({ text: lesson.userLesson?.notes || 'None '});

      return vals;
    });

    // Assign the PDF content
    const content = [
      {
        text: `${profile.syllabus.title} - Version ${profile.syllabus.version }`,
        style: 'h1'
      },
      { text: `Progress: ${completeLessonCount} / ${lessons.length}`},
      { text: `Effective Date: ${dayjs().format('MMMM D, YYYY')}`},
      ...lessonContent.flat()
    ];

    // Create the PDF
    const printer = new pdfPrinter(fonts);
    const pdfDoc = printer.createPdfKitDocument({
      content,
      styles: pdfStyles,
    });

    // Send the file back to the user
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${profile.fullName.split(' ').join('-')}-${profile.syllabus.title}-progress-report.pdf"`);
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    next(err);
  }
}
