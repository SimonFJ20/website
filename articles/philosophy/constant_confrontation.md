
# Constant confrontation

*S. F. Jakobsen &lt;sfja2004@gmail.com&gt;, 28. December 2023*

## Branching in software development

In the art of software development is also embedded the art of having multiple people working on the same software code base. Being multiple people working on the same atomic code base, means working concurrently on the same material. This will naturally lead to conflicts of changes, ie. one developer will change a line of code that another developer has already changed.

This can be avoided by some methods. For example could all the developers edit the same exact 'version' of the project on a single machine, central server, etc. Many times, this isn't practical for various reasons. The only practical real world solution, is for each atomic group of developers (individual or 'mob') to get a copy of the code base onto their own computer. 

A method of 'avoiding' these conflicts, is not avoiding them, but delaying them as much as possible. This is often the case with the technique software developers refer to as 'feature branching.' This is a technique where a single or a handful of developers 'fork' the code base, make all the necessary changes, and then merge the changes back into the original code base, when all is done and tested.

This obviously leads to massive issues of what's called 'merge conflicts.'

People will start associating merging with massive issues of merge conflicts. People will naturally because of this, resort to minimizing mergin as much as possible, ie. delaying merging as much as possible. This is obviously a vicious circle.

If on the contrary the developers instead of merging changes as **in**frequently as possible, merge their changes as frequently as possible, we see something counter-intuitive happen. The naive developer will think, that frequenting the merging of changes, means that they will spend more time on merge issues. But quite the contrary. Reducing the time between merges, also reduces the amount of changes to be merged, ie. the time needed to merge the change will also decrease. The proportion is not linear.[^1] If the developers strive to merge as frequently as possible, ie. strive to merge constantly, the issues of merge conflicts will be minimized.

People who advocate for this in the world of software development refer to it as 'continous integration', and have collected evidence for the possitive effects.[^2]

We could rationally understand constant merging as constant confrontation of changes of version.

## A student in a classroom

Imagine a classroom setting. Two to three dozen students sitting in the classroom with a teacher up at the front. Over a semester the students will be tought knowledge, which they will then use, to understand further knowledge.

A problem then arises when an individual student fails to understand the exact point being taught. Because of this lack of understanding of one point, the student will then fail to understand a future point building upon it.

The students themselves has methods of communicating the fact that they didn't understand the point. But in doing so, they put themselves at certain direct and indirect risks. They risk getting a lower grade by the teacher, this is a direct risk. They risk achieving a lower social status in the class, in relation to the other students. As this isn't a certainty and is dependent the situation, I'll treat this as an indirect risk.

Due to these risks, students who fail to lack a point will be entrapped in a vicious cycle of lacking understanding, which in turn, will make them fail to understand further points.

To combat this, each student has to be confronted with their knowledge and understanding of the subject regularly.

The more time that passes between each confrontation of the individual student, the harsher the consequences seem for the student. This will make the student avoid confrontation, and in turn increase the time that passes between each confrontation.

Counter-intuitively (from the student's perspective) a solution is again, to reduce the time between confrontation. The less time between confrontation, the lesser the lacking of understanding and knowledge develops and the lesser the consequences. In short, the relationship of the student and the teacher, should be nutured so that it strives towards constant confrontation.

## The contractor, the client and the product

When a client asks a contractor for a piece of work, the contractor will then do the work, ie. a product, so that it follows what the contractor's idea of what the client's idea is for that product.

Unless a miracle happens, the client's idea and the contractor's idea will differ. This means that the contractor will spend time (contractor's time = client's money) on work, which the client doesn't want. This is obviously unfavorable.

To combat this, the contractor and the client will contact each other during the process, and discuss the idea.

The client is busy with other things, so they will not be interested in contacting the contractor above the essential. They will also naturally expect the contractor, to make the product as the client had envisioned it.

An important point is, that it is in the best interest both the client and the contractor, that the product is made according to the client's idea. The client's interest is obvious. The contractor's interest lies in the fact, that the client is more likely to keep the contractor relationship after the fact. Also, that the contractor may have made some promises, with which they will lose money if they're broken, eg. a deadline.

The contractor will often not think of their idea differing from the client's idea of the product. Only in cases where the contractors's idea is objectivly incompatible with something in some way, will the contractor seek to consult the client.

It is obvious that striving towards constant confrontation would be an optimal strategy in this situation, but only for the outside observer. Remember that the client already thinks, that the contractor is making the product the right way. Now we introduce another issue. Getting confronted as a contractor by the client, and the client finding out, that the contractor has spent time making a product, which the client does not want, is unpleasant. This will obviously, as with the before stated examples, throw the contractor into a vicious cycle of avoiding confrontation.

Here we have to remind the contractor, that it is in their best interest to strive towards constant confrontation.

## Conclusion

> By confronting issues earlier, you reduce the amount of toil debt substantially, and as such even though you experience more conflict, on average, the toil sum is reduced.

When situations of periodic confrontation occurs, and confrontations seem for one part undesirable, the one part will attempt at delaying these confrontations, intensifying the consequences of the confrontation. The one part will become entrapped in a vicious cycle of delaying confrontation. All parties involved in such a situation should strive towards constant confrontation in order to minimize consequences.

## Sources/Notes

[^1]: As time passes between merges, changes will accumulate not only on the side of the developers own version, but the other developers will concurrently make changes to the 'upstream' version.

[^2]: [Continous Delivery: Continuous Integration vs Feature Branch Workflow](https://youtu.be/v4Ijkq6Myfc?feature=shared&t=157)

