<template>
  <div class="register">
    <v-textarea
      v-model="inputText"
      label="Input text"
    ></v-textarea>

    <BreakingDownPanel
      v-for="(sentence, index) in brokenDownText.sentences"
      :key="index"
      :sentence="sentence"
      :words="sentence.words"
    ></BreakingDownPanel>

  </div>
</template>

<script>
import BreakingDownPanel from '@/components/BreakingDownPanel.vue'
import nlp from 'compromise'
import compromise_sentences from 'compromise-sentences'
nlp.extend(compromise_sentences)

export default {
  name: "register",

  components: {
    BreakingDownPanel,
  },

  data: () => ({
    inputText: '',
  }),

  computed: {
    brokenDownText() {
      let brokenDownText = {
        original: this.inputText,
        sentences: []
      }

      let sentences = nlp(this.inputText).sentences().json()

      brokenDownText.sentences = sentences.map(sentence => {

        let words = nlp(sentence.text).termList()

        return {
          original: sentence.text,
          normal: sentence.normal,

          words: words.map(word => {
            return {
              original: word.text,
              normal: word.reduced,
            }
          }),
        }
      })

      return brokenDownText
    },
  },
}
</script>

